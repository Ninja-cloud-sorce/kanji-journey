#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Supabase -> Firestore migration utility
 *
 * Usage:
 *   node scripts/migrations/supabase_to_firestore.cjs --dry-run
 *   node scripts/migrations/supabase_to_firestore.cjs --phase=content
 *   node scripts/migrations/supabase_to_firestore.cjs --phase=users --batch=500
 *
 * Required env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const argMap = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
);

const DRY_RUN = Boolean(argMap['dry-run']);
const PHASE = (argMap.phase || 'all').toString();
const BATCH_SIZE = Math.max(50, Number(argMap.batch || 1000));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

async function fetchSupabaseRows(table, limit = 1000) {
  const rows = [];
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    url.searchParams.set('select', '*');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch ${table}: ${res.status} ${text}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch)) {
      throw new Error(`Unexpected payload for ${table}`);
    }
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return rows;
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function userDocFromProfile(profile) {
  return {
    id: profile.user_id,
    displayName: profile.display_name ?? 'Learner',
    currentLevel: profile.current_level ?? 'N5',
    goalExamDate: profile.exam_date ?? null,
    dailyGoalMinutes: profile.daily_goal_minutes ?? 15,
    streak: profile.streak ?? 0,
    readinessScore: profile.readiness_score ?? 0,
    learningPathLabel: profile.learning_path ?? null,
    onboardingCompleted: Boolean(profile.onboarding_completed),
    createdAt: profile.created_at ?? null,
    updatedAt: profile.updated_at ?? null,
  };
}

function lessonDocFromCatalog(lesson) {
  return {
    id: lesson.id,
    level: lesson.level,
    module: lesson.skill_area,
    title: lesson.title,
    weekNumber: lesson.week_number,
    order: lesson.lesson_number,
    tags: lesson.topics ?? [],
    createdAt: lesson.created_at ?? null,
  };
}

function questionDocFromPractice(q) {
  const options = Array.isArray(q.options) ? q.options : [];
  const correctAnswer = options[q.correct_index] ?? null;
  return {
    id: q.id,
    level: q.level,
    topic: q.topic,
    section: q.section,
    prompt: `${q.prompt ?? ''} ${q.display_text ?? ''}`.trim(),
    options,
    correctIndex: q.correct_index ?? 0,
    correctAnswer,
    explanation: q.explanation ?? null,
    examReady: Boolean(q.is_exam_ready),
    difficulty: q.difficulty ?? 'medium',
    createdAt: q.created_at ?? null,
  };
}

function groupAttemptsIntoSessions(attempts) {
  const groups = new Map();
  for (const a of attempts) {
    const stamp = (a.completed_at || '').slice(0, 10);
    const key = `${a.user_id}::${a.lesson_id}::${stamp}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key.replace(/[:]/g, '_'),
        userId: a.user_id,
        lessonId: a.lesson_id,
        level: null,
        topic: a.topic || a.skill_area || 'vocabulary',
        startedAt: a.completed_at,
        finishedAt: a.completed_at,
        answers: [],
      });
    }
    const g = groups.get(key);
    g.answers.push({
      id: a.id,
      questionId: a.question_id,
      questionText: a.question_text,
      selectedAnswer: a.user_answer,
      correctAnswer: a.correct_answer,
      isCorrect: Boolean(a.is_correct),
      skillArea: a.skill_area,
      topic: a.topic,
      answeredAt: a.completed_at,
    });
    if (a.completed_at > g.finishedAt) g.finishedAt = a.completed_at;
    if (a.completed_at < g.startedAt) g.startedAt = a.completed_at;
  }

  return Array.from(groups.values()).map((s) => {
    const total = s.answers.length;
    const correct = s.answers.filter((a) => a.isCorrect).length;
    return {
      ...s,
      questionCount: total,
      correctCount: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });
}

function buildProgressDocs({ users, lessonProgress, weakTopics, attempts }) {
  const lpByUser = new Map();
  for (const row of lessonProgress) {
    if (!lpByUser.has(row.user_id)) lpByUser.set(row.user_id, []);
    lpByUser.get(row.user_id).push(row);
  }

  const weakByUser = new Map();
  for (const row of weakTopics) {
    if (!weakByUser.has(row.user_id)) weakByUser.set(row.user_id, []);
    weakByUser.get(row.user_id).push(row);
  }

  const attemptByUser = new Map();
  for (const row of attempts) {
    if (!attemptByUser.has(row.user_id)) attemptByUser.set(row.user_id, []);
    attemptByUser.get(row.user_id).push(row);
  }

  return users.map((u) => {
    const lp = lpByUser.get(u.id) || [];
    const wt = weakByUser.get(u.id) || [];
    const at = attemptByUser.get(u.id) || [];

    const totalLessons = lp.length;
    const completedLessons = lp.filter((x) => x.completed).length;
    const overallCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const moduleCompletion = {};
    for (const row of lp) {
      const key = `${row.level}.${row.level}_${row.week_number}`;
      if (!moduleCompletion[key]) moduleCompletion[key] = { total: 0, done: 0 };
      moduleCompletion[key].total += 1;
      if (row.completed) moduleCompletion[key].done += 1;
    }

    const weakTopics = wt.map((x) => ({
      topic: x.topic,
      skillArea: x.skill_area,
      mistakesCount: x.mistakes_count,
      lastSeenAt: x.last_seen_at,
    }));

    return {
      userId: u.id,
      readinessScore: u.readinessScore ?? 0,
      targetReadiness: Math.max(70, u.readinessScore ?? 0),
      overallCompletion,
      moduleCompletion,
      weakTopics,
      attemptsCount: at.length,
      lastCalculatedAt: new Date().toISOString(),
    };
  });
}

async function initFirestore() {
  let admin;
  try {
    // optional dependency; required only when running migration
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');
  } catch {
    throw new Error(
      'firebase-admin is not installed. Run: npm i firebase-admin --save-dev'
    );
  }

  const projectId = requiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = requiredEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

async function writeBatches(db, writes, label) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${label}: ${writes.length} writes`);
    return;
  }

  const batches = chunk(writes, 450);
  for (let i = 0; i < batches.length; i += 1) {
    const b = db.batch();
    for (const w of batches[i]) {
      const ref = db.doc(w.path);
      b.set(ref, w.data, { merge: true });
    }
    await b.commit();
    if ((i + 1) % 10 === 0 || i + 1 === batches.length) {
      console.log(`[commit] ${label}: ${i + 1}/${batches.length}`);
    }
  }
}

async function main() {
  requiredEnv('SUPABASE_URL');
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  console.log(`Starting migration phase="${PHASE}" dryRun=${DRY_RUN} batch=${BATCH_SIZE}`);

  const report = {
    startedAt: new Date().toISOString(),
    phase: PHASE,
    dryRun: DRY_RUN,
    counts: {},
  };

  const shouldRun = (name) => PHASE === 'all' || PHASE === name;
  const db = await initFirestore();

  if (shouldRun('content') || shouldRun('all')) {
    const [lessonCatalog, practiceQuestions] = await Promise.all([
      fetchSupabaseRows('lesson_catalog', BATCH_SIZE),
      fetchSupabaseRows('practice_questions', BATCH_SIZE),
    ]);
    report.counts.lesson_catalog = lessonCatalog.length;
    report.counts.practice_questions = practiceQuestions.length;

    const lessonWrites = [];
    const curriculumWrites = [];
    for (const lesson of lessonCatalog) {
      const mapped = lessonDocFromCatalog(lesson);
      lessonWrites.push({ path: `lessons/${lesson.id}`, data: mapped });
      curriculumWrites.push({
        path: `curriculum/${lesson.level}/modules/${lesson.skill_area}/lessons/${lesson.id}`,
        data: {
          lessonId: lesson.id,
          title: lesson.title,
          weekNumber: lesson.week_number,
          order: lesson.lesson_number,
        },
      });
    }

    const questionWrites = practiceQuestions.map((q) => ({
      path: `questions/${q.id}`,
      data: questionDocFromPractice(q),
    }));

    await writeBatches(db, lessonWrites, 'lessons');
    await writeBatches(db, curriculumWrites, 'curriculum_refs');
    await writeBatches(db, questionWrites, 'questions');
  }

  if (shouldRun('users') || shouldRun('all')) {
    const [profiles, learningPaths, levelOverrides] = await Promise.all([
      fetchSupabaseRows('profiles', BATCH_SIZE),
      fetchSupabaseRows('learning_paths', BATCH_SIZE),
      fetchSupabaseRows('level_overrides', BATCH_SIZE),
    ]);
    report.counts.profiles = profiles.length;
    report.counts.learning_paths = learningPaths.length;
    report.counts.level_overrides = levelOverrides.length;

    const lpByUser = new Map(learningPaths.map((x) => [x.user_id, x]));
    const loByUser = new Map(levelOverrides.map((x) => [x.user_id, x]));

    const userWrites = profiles.map((p) => {
      const mapped = userDocFromProfile(p);
      const pathData = lpByUser.get(p.user_id);
      const override = loByUser.get(p.user_id);
      return {
        path: `users/${p.user_id}`,
        data: {
          ...mapped,
          path: {
            selectedLevel: pathData?.selected_level ?? mapped.currentLevel,
            motivation: pathData?.motivation ?? null,
            hoursPerWeek: pathData?.hours_per_week ?? null,
            priorExperience: pathData?.prior_experience ?? null,
            overrideLevel: override?.level ?? null,
            overrideConfirmedAt: override?.confirmed_at ?? null,
          },
        },
      };
    });

    await writeBatches(db, userWrites, 'users');
  }

  if (shouldRun('history') || shouldRun('all')) {
    const [attempts, lessonProgress, weakTopics, profiles] = await Promise.all([
      fetchSupabaseRows('quiz_attempts', BATCH_SIZE),
      fetchSupabaseRows('lesson_progress', BATCH_SIZE),
      fetchSupabaseRows('weak_topics', BATCH_SIZE),
      fetchSupabaseRows('profiles', BATCH_SIZE),
    ]);
    report.counts.quiz_attempts = attempts.length;
    report.counts.lesson_progress = lessonProgress.length;
    report.counts.weak_topics = weakTopics.length;

    const sessions = groupAttemptsIntoSessions(attempts);
    report.counts.practice_sessions_generated = sessions.length;

    const sessionWrites = [];
    const answerWrites = [];
    for (const s of sessions) {
      sessionWrites.push({
        path: `practice_sessions/${s.id}`,
        data: {
          userId: s.userId,
          lessonId: s.lessonId,
          level: s.level,
          topic: s.topic,
          startedAt: s.startedAt,
          finishedAt: s.finishedAt,
          questionCount: s.questionCount,
          correctCount: s.correctCount,
          accuracy: s.accuracy,
        },
      });
      for (const a of s.answers) {
        answerWrites.push({
          path: `practice_sessions/${s.id}/answers/${a.id}`,
          data: a,
        });
      }
    }

    const users = profiles.map(userDocFromProfile);
    const progressDocs = buildProgressDocs({
      users,
      lessonProgress,
      weakTopics,
      attempts,
    });

    const progressWrites = progressDocs.map((p) => ({
      path: `progress/${p.userId}`,
      data: p,
    }));

    await writeBatches(db, sessionWrites, 'practice_sessions');
    await writeBatches(db, answerWrites, 'practice_answers');
    await writeBatches(db, progressWrites, 'progress');
  }

  report.completedAt = new Date().toISOString();
  const outDir = path.join(process.cwd(), 'scripts', 'migrations', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `migration-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`Migration report written: ${outFile}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
