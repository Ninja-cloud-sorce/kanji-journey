-- =============================================================================
-- Kanji Journey — Full Schema Migration
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- ─── 1. Extend profiles ──────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- ─── 2. lesson_catalog ───────────────────────────────────────────────────────
-- The canonical curriculum. Seeded once; read-only for regular users.
CREATE TABLE IF NOT EXISTS public.lesson_catalog (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level         text NOT NULL CHECK (level IN ('N5','N4','N3','N2','N1')),
  week_number   integer NOT NULL,
  lesson_number integer NOT NULL DEFAULT 1,
  title         text NOT NULL,
  skill_area    text NOT NULL CHECK (skill_area IN ('vocabulary','grammar','listening','reading','kanji')),
  topics        text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level, week_number, lesson_number)
);

-- Seed N5 curriculum (8 weeks)
INSERT INTO public.lesson_catalog (level, week_number, lesson_number, title, skill_area, topics)
VALUES
  ('N5', 1, 1, 'Hiragana — あいうえお row',    'kanji',      '{"hiragana","pronunciation"}'),
  ('N5', 1, 2, 'Hiragana — かきくけこ row',    'kanji',      '{"hiragana","pronunciation"}'),
  ('N5', 2, 1, 'Katakana — アイウエオ row',    'kanji',      '{"katakana","loanwords"}'),
  ('N5', 2, 2, 'Katakana — カキクケコ row',    'kanji',      '{"katakana","loanwords"}'),
  ('N5', 3, 1, 'Basic Greetings',              'vocabulary', '{"greetings","politeness"}'),
  ('N5', 3, 2, 'Core Particles は を に で',  'grammar',    '{"particles","sentence structure"}'),
  ('N5', 4, 1, 'Numbers 1–100',               'vocabulary', '{"numbers","counting"}'),
  ('N5', 4, 2, 'Date & Time',                 'vocabulary', '{"time","calendar"}'),
  ('N5', 5, 1, 'Basic い-adjectives',          'grammar',    '{"adjectives","description"}'),
  ('N5', 5, 2, 'Basic な-adjectives',          'grammar',    '{"adjectives","polite forms"}'),
  ('N5', 6, 1, 'Essential Verbs — Group 1',   'grammar',    '{"verbs","conjugation"}'),
  ('N5', 6, 2, 'Essential Verbs — Group 2',   'grammar',    '{"verbs","て-form"}'),
  ('N5', 7, 1, 'N5 Vocabulary Review',        'vocabulary', '{"review","N5 vocab"}'),
  ('N5', 7, 2, 'N5 Kanji 80 — Part 1',       'kanji',      '{"kanji","stroke order"}'),
  ('N5', 8, 1, 'N5 Mock Exam — Listening',   'listening',  '{"mock exam","listening"}'),
  ('N5', 8, 2, 'N5 Mock Exam — Reading',     'reading',    '{"mock exam","reading"}'),
  -- N4 week 1 stub (so roadmap has something to show)
  ('N4', 1, 1, 'N4 Kanji — Part 1',          'kanji',      '{"kanji","N4"}'),
  ('N4', 1, 2, 'N4 Grammar — て-form uses',   'grammar',    '{"grammar","N4"}'),
  -- N3
  ('N3', 1, 1, 'N3 Kanji — Part 1',          'kanji',      '{"kanji","N3"}'),
  -- N2
  ('N2', 1, 1, 'N2 Grammar Overview',        'grammar',    '{"grammar","N2"}'),
  -- N1
  ('N1', 1, 1, 'N1 Advanced Reading',        'reading',    '{"reading","N1"}')
ON CONFLICT (level, week_number, lesson_number) DO NOTHING;

-- ─── 3. learning_paths ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_level       text NOT NULL DEFAULT 'N5',
  motivation           text,
  hours_per_week       integer,
  prior_experience     text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ─── 4. level_overrides ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.level_overrides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level         text NOT NULL CHECK (level IN ('N5','N4','N3','N2','N1')),
  confirmed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)  -- only one active override per user
);

-- ─── 5. lesson_progress ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id       uuid NOT NULL REFERENCES public.lesson_catalog(id) ON DELETE CASCADE,
  level           text NOT NULL,
  week_number     integer NOT NULL,
  completed       boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,
  quiz_score      integer,         -- percentage 0–100
  time_spent_sec  integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- ─── 6. quiz_attempts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id       uuid NOT NULL REFERENCES public.lesson_catalog(id) ON DELETE CASCADE,
  question_id     text NOT NULL,      -- stable question identifier
  question_text   text NOT NULL,
  correct_answer  text NOT NULL,
  user_answer     text NOT NULL,
  is_correct      boolean NOT NULL,
  skill_area      text NOT NULL,
  topic           text NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── 7. weak_topics ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.weak_topics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic           text NOT NULL,
  skill_area      text NOT NULL,
  mistakes_count  integer NOT NULL DEFAULT 0,
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic, skill_area)
);

-- ─── 8. flashcards ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcards (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id         uuid REFERENCES public.lesson_catalog(id) ON DELETE SET NULL,
  front             text NOT NULL,
  back              text NOT NULL,
  -- SM-2 fields
  ease_factor       numeric NOT NULL DEFAULT 2.5,
  interval_days     integer NOT NULL DEFAULT 1,
  review_state      text NOT NULL DEFAULT 'new'
                    CHECK (review_state IN ('new','learning','review','relearning')),
  next_review_date  date NOT NULL DEFAULT CURRENT_DATE,
  reviews_total     integer NOT NULL DEFAULT 0,
  reviews_correct   integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_learning_paths_user     ON public.learning_paths (user_id);
CREATE INDEX IF NOT EXISTS idx_level_overrides_user    ON public.level_overrides (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user    ON public.lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_level   ON public.lesson_progress (user_id, level);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user      ON public.quiz_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson    ON public.quiz_attempts (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_weak_topics_user        ON public.weak_topics (user_id, mistakes_count DESC);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_due     ON public.flashcards (user_id, next_review_date);

-- =============================================================================
-- RLS — Enable on every user-scoped table
-- =============================================================================
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_topics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards      ENABLE ROW LEVEL SECURITY;
-- lesson_catalog is public (no RLS needed — read-only reference data)

-- profiles — existing policies should already exist; recreate safely
DO $$ BEGIN
  CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- learning_paths
DO $$ BEGIN CREATE POLICY "learning_paths_select" ON public.learning_paths FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "learning_paths_insert" ON public.learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "learning_paths_update" ON public.learning_paths FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "learning_paths_delete" ON public.learning_paths FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- level_overrides
DO $$ BEGIN CREATE POLICY "level_overrides_select" ON public.level_overrides FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "level_overrides_insert" ON public.level_overrides FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "level_overrides_update" ON public.level_overrides FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- lesson_progress
DO $$ BEGIN CREATE POLICY "lesson_progress_select" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "lesson_progress_insert" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "lesson_progress_update" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quiz_attempts
DO $$ BEGIN CREATE POLICY "quiz_attempts_select" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "quiz_attempts_insert" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- weak_topics
DO $$ BEGIN CREATE POLICY "weak_topics_select" ON public.weak_topics FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "weak_topics_insert" ON public.weak_topics FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "weak_topics_update" ON public.weak_topics FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- flashcards
DO $$ BEGIN CREATE POLICY "flashcards_select" ON public.flashcards FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "flashcards_insert" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "flashcards_update" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "flashcards_delete" ON public.flashcards FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- Trigger: handle_new_user — auto-creates profile on auth.users insert
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, current_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    'N5'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- RPC: complete_lesson(...)
-- Transactional: upsert lesson_progress, insert quiz_attempts,
--               update streak, recalculate readiness, upsert weak_topics,
--               insert flashcards from mistakes
-- =============================================================================
CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_lesson_id       uuid,
  p_quiz_answers    jsonb,   -- array of {question_id, question_text, correct_answer, user_answer, is_correct, skill_area, topic}
  p_time_spent_sec  integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id         uuid := auth.uid();
  v_lesson          lesson_catalog%ROWTYPE;
  v_total_q         integer;
  v_correct_q       integer;
  v_quiz_score      integer;
  v_streak          integer;
  v_last_completed  date;
  v_today           date := CURRENT_DATE;
  v_readiness       integer;
  v_answer          jsonb;
BEGIN
  -- Validate user
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch lesson catalog row
  SELECT * INTO v_lesson FROM lesson_catalog WHERE id = p_lesson_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found: %', p_lesson_id;
  END IF;

  -- Calculate quiz score
  v_total_q   := jsonb_array_length(p_quiz_answers);
  v_correct_q := (
    SELECT COUNT(*) FROM jsonb_array_elements(p_quiz_answers) AS a
    WHERE (a->>'is_correct')::boolean = true
  );
  v_quiz_score := CASE WHEN v_total_q > 0 THEN (v_correct_q * 100 / v_total_q) ELSE 100 END;

  -- Upsert lesson_progress
  INSERT INTO lesson_progress (user_id, lesson_id, level, week_number, completed, completed_at, quiz_score, time_spent_sec)
  VALUES (v_user_id, p_lesson_id, v_lesson.level, v_lesson.week_number, true, now(), v_quiz_score, p_time_spent_sec)
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    completed      = true,
    completed_at   = now(),
    quiz_score     = EXCLUDED.quiz_score,
    time_spent_sec = lesson_progress.time_spent_sec + EXCLUDED.time_spent_sec;

  -- Insert quiz attempts
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_quiz_answers)
  LOOP
    INSERT INTO quiz_attempts (user_id, lesson_id, question_id, question_text, correct_answer, user_answer, is_correct, skill_area, topic)
    VALUES (
      v_user_id,
      p_lesson_id,
      v_answer->>'question_id',
      v_answer->>'question_text',
      v_answer->>'correct_answer',
      v_answer->>'user_answer',
      (v_answer->>'is_correct')::boolean,
      v_answer->>'skill_area',
      v_answer->>'topic'
    );

    -- Upsert weak_topics for wrong answers
    IF NOT (v_answer->>'is_correct')::boolean THEN
      INSERT INTO weak_topics (user_id, topic, skill_area, mistakes_count, last_seen_at)
      VALUES (v_user_id, v_answer->>'topic', v_answer->>'skill_area', 1, now())
      ON CONFLICT (user_id, topic, skill_area)
      DO UPDATE SET
        mistakes_count = weak_topics.mistakes_count + 1,
        last_seen_at   = now();

      -- Create flashcard from mistake
      INSERT INTO flashcards (user_id, lesson_id, front, back, next_review_date)
      VALUES (
        v_user_id,
        p_lesson_id,
        v_answer->>'question_text',
        v_answer->>'correct_answer',
        CURRENT_DATE + 1  -- review tomorrow
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Update streak
  SELECT streak INTO v_streak FROM profiles WHERE user_id = v_user_id;
  SELECT MAX(completed_at::date) INTO v_last_completed
    FROM lesson_progress
    WHERE user_id = v_user_id AND completed = true AND lesson_id != p_lesson_id;

  IF v_last_completed IS NULL OR v_last_completed < v_today - INTERVAL '1 day' THEN
    -- Either first lesson or gap — reset to 1 if gap > 1 day, else increment
    IF v_last_completed = v_today - INTERVAL '1 day' THEN
      v_streak := COALESCE(v_streak, 0) + 1;
    ELSIF v_last_completed = v_today THEN
      -- Already completed today — don't change streak
      NULL;
    ELSE
      v_streak := 1;  -- broken streak
    END IF;
  END IF;

  -- Recalculate readiness score
  v_readiness := public.recalculate_readiness(v_user_id, v_lesson.level);

  -- Update profile
  UPDATE profiles
  SET streak = v_streak, readiness_score = v_readiness, updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'quiz_score',   v_quiz_score,
    'streak',       v_streak,
    'readiness',    v_readiness,
    'cards_created', (
      SELECT COUNT(*) FROM jsonb_array_elements(p_quiz_answers) AS a
      WHERE (a->>'is_correct')::boolean = false
    )
  );
END;
$$;

-- =============================================================================
-- RPC: recalculate_readiness(user_id, level) → integer (0–100)
-- Formula: 40% quiz accuracy + 35% lesson coverage + 25% flashcard retention
-- =============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_readiness(
  p_user_id  uuid,
  p_level    text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total_lessons       integer;
  v_completed_lessons   integer;
  v_recent_quiz_acc     numeric;
  v_flash_retention     numeric;
  v_coverage            numeric;
  v_readiness           integer;
BEGIN
  -- Lesson coverage for this level
  SELECT COUNT(*) INTO v_total_lessons FROM lesson_catalog WHERE level = p_level;
  SELECT COUNT(*) INTO v_completed_lessons
    FROM lesson_progress
    WHERE user_id = p_user_id AND level = p_level AND completed = true;

  v_coverage := CASE WHEN v_total_lessons > 0
    THEN (v_completed_lessons::numeric / v_total_lessons) * 100
    ELSE 0 END;

  -- Recent quiz accuracy (last 20 attempts)
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN (COUNT(*) FILTER (WHERE is_correct))::numeric / COUNT(*) * 100
      ELSE 0
    END INTO v_recent_quiz_acc
  FROM (
    SELECT is_correct FROM quiz_attempts
    WHERE user_id = p_user_id
    ORDER BY completed_at DESC LIMIT 20
  ) sub;

  -- Flashcard retention (reviewed cards in last 7 days)
  SELECT
    CASE WHEN COUNT(*) > 0
      THEN (SUM(reviews_correct)::numeric / NULLIF(SUM(reviews_total), 0)) * 100
      ELSE 0
    END INTO v_flash_retention
  FROM flashcards
  WHERE user_id = p_user_id AND reviews_total > 0;

  v_flash_retention := COALESCE(v_flash_retention, 0);

  v_readiness := LEAST(100, GREATEST(0,
    ROUND(0.40 * v_recent_quiz_acc + 0.35 * v_coverage + 0.25 * v_flash_retention)
  ))::integer;

  RETURN v_readiness;
END;
$$;

-- =============================================================================
-- RPC: review_flashcard(card_id, grade) — SM-2 scheduling
-- grade: 0=blackout, 1=wrong, 2=hard, 3=ok, 4=good, 5=perfect
-- =============================================================================
CREATE OR REPLACE FUNCTION public.review_flashcard(
  p_card_id  uuid,
  p_grade    integer  -- 0..5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_card        flashcards%ROWTYPE;
  v_ef          numeric;
  v_interval    integer;
  v_state       text;
  v_next_date   date;
BEGIN
  SELECT * INTO v_card FROM flashcards WHERE id = p_card_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flashcard not found or access denied';
  END IF;

  v_ef       := v_card.ease_factor;
  v_interval := v_card.interval_days;

  -- SM-2 algorithm
  IF p_grade >= 3 THEN
    -- Correct response
    IF v_card.review_state = 'new' OR v_card.review_state = 'learning' THEN
      v_interval := 1;
      v_state    := 'review';
    ELSIF v_interval = 1 THEN
      v_interval := 6;
    ELSE
      v_interval := ROUND(v_interval * v_ef);
    END IF;
    -- Adjust ease factor
    v_ef := GREATEST(1.3, v_ef + (0.1 - (5 - p_grade) * (0.08 + (5 - p_grade) * 0.02)));
    v_state := 'review';
  ELSE
    -- Wrong response — reset
    v_interval := 1;
    v_state    := 'relearning';
    v_ef       := GREATEST(1.3, v_ef - 0.2);
  END IF;

  v_next_date := CURRENT_DATE + v_interval;

  UPDATE flashcards SET
    ease_factor      = v_ef,
    interval_days    = v_interval,
    review_state     = v_state,
    next_review_date = v_next_date,
    reviews_total    = reviews_total + 1,
    reviews_correct  = reviews_correct + CASE WHEN p_grade >= 3 THEN 1 ELSE 0 END,
    updated_at       = now()
  WHERE id = p_card_id;

  RETURN jsonb_build_object(
    'interval_days',    v_interval,
    'ease_factor',      v_ef,
    'review_state',     v_state,
    'next_review_date', v_next_date
  );
END;
$$;

-- Grant execute on RPCs to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid, jsonb, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_readiness(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_flashcard(uuid, integer) TO authenticated;
