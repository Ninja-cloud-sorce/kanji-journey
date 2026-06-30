#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Supabase <-> Firestore parity verifier
 *
 * Usage:
 *   node scripts/migrations/verify_firestore_parity.cjs --sample=25
 *   node scripts/migrations/verify_firestore_parity.cjs --sample=50 --strict
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

const SAMPLE_SIZE = Math.max(5, Number(argMap.sample || 25));
const STRICT = Boolean(argMap.strict);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
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
    if (!Array.isArray(batch)) throw new Error(`Unexpected payload for ${table}`);
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return rows;
}

function pickRandomSample(items, size) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(size, arr.length));
}

async function initFirestore() {
  let admin;
  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');
  } catch {
    throw new Error('firebase-admin is not installed. Run: npm i firebase-admin --save-dev');
  }

  const projectId = requiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = requiredEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = requiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

async function getCollectionCount(db, collectionName) {
  const snap = await db.collection(collectionName).count().get();
  return snap.data().count;
}

function compareNumber(name, source, target, findings) {
  if (source !== target) {
    findings.push({
      severity: 'error',
      type: 'count_mismatch',
      name,
      source,
      target,
      delta: target - source,
    });
  }
}

async function main() {
  requiredEnv('SUPABASE_URL');
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const db = await initFirestore();

  const report = {
    startedAt: new Date().toISOString(),
    sampleSize: SAMPLE_SIZE,
    strict: STRICT,
    summary: {},
    findings: [],
  };

  const [profiles, lessonCatalog, practiceQuestions, attempts] = await Promise.all([
    fetchSupabaseRows('profiles'),
    fetchSupabaseRows('lesson_catalog'),
    fetchSupabaseRows('practice_questions'),
    fetchSupabaseRows('quiz_attempts'),
  ]);

  const [usersCount, lessonsCount, questionsCount, sessionsCount, progressCount] = await Promise.all([
    getCollectionCount(db, 'users'),
    getCollectionCount(db, 'lessons'),
    getCollectionCount(db, 'questions'),
    getCollectionCount(db, 'practice_sessions'),
    getCollectionCount(db, 'progress'),
  ]);

  report.summary.counts = {
    supabase: {
      profiles: profiles.length,
      lesson_catalog: lessonCatalog.length,
      practice_questions: practiceQuestions.length,
      quiz_attempts: attempts.length,
    },
    firestore: {
      users: usersCount,
      lessons: lessonsCount,
      questions: questionsCount,
      practice_sessions: sessionsCount,
      progress: progressCount,
    },
  };

  compareNumber('profiles->users', profiles.length, usersCount, report.findings);
  compareNumber('lesson_catalog->lessons', lessonCatalog.length, lessonsCount, report.findings);
  compareNumber('practice_questions->questions', practiceQuestions.length, questionsCount, report.findings);
  compareNumber('profiles->progress', profiles.length, progressCount, report.findings);

  const sampledUsers = pickRandomSample(profiles, SAMPLE_SIZE);
  const sampleFindings = [];

  for (const p of sampledUsers) {
    const [userSnap, progressSnap] = await Promise.all([
      db.doc(`users/${p.user_id}`).get(),
      db.doc(`progress/${p.user_id}`).get(),
    ]);

    if (!userSnap.exists) {
      sampleFindings.push({
        severity: 'error',
        type: 'missing_user_doc',
        userId: p.user_id,
      });
      continue;
    }

    const user = userSnap.data() || {};
    const mismatches = [];
    if ((user.currentLevel ?? 'N5') !== (p.current_level ?? 'N5')) {
      mismatches.push('currentLevel');
    }
    if ((user.streak ?? 0) !== (p.streak ?? 0)) {
      mismatches.push('streak');
    }
    if ((user.readinessScore ?? 0) !== (p.readiness_score ?? 0)) {
      mismatches.push('readinessScore');
    }
    if ((user.dailyGoalMinutes ?? 15) !== (p.daily_goal_minutes ?? 15)) {
      mismatches.push('dailyGoalMinutes');
    }

    if (mismatches.length > 0) {
      sampleFindings.push({
        severity: 'warn',
        type: 'user_field_mismatch',
        userId: p.user_id,
        fields: mismatches,
      });
    }

    if (!progressSnap.exists) {
      sampleFindings.push({
        severity: 'warn',
        type: 'missing_progress_doc',
        userId: p.user_id,
      });
    }
  }

  report.summary.sampleChecked = sampledUsers.length;
  report.summary.sampleIssues = sampleFindings.length;
  report.findings.push(...sampleFindings);
  report.completedAt = new Date().toISOString();

  const outDir = path.join(process.cwd(), 'scripts', 'migrations', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `parity-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

  const errorCount = report.findings.filter((f) => f.severity === 'error').length;
  const warnCount = report.findings.filter((f) => f.severity === 'warn').length;

  console.log(`Parity report: ${outFile}`);
  console.log(`Findings: errors=${errorCount}, warnings=${warnCount}`);

  if (STRICT && (errorCount > 0 || warnCount > 0)) {
    process.exit(2);
  }
  if (!STRICT && errorCount > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
