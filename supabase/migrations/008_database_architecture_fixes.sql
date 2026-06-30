-- =============================================================================
-- Database Architecture Fixes — public.lessons View & complete_lesson RPC
-- =============================================================================

-- 1. Fix public.lessons Compatibility View: Declare 'id' as UUID matching 'lc.id' (not ::text)
CREATE OR REPLACE VIEW public.lessons AS
SELECT
  lc.id AS id,
  CASE
    WHEN lc.topics @> ARRAY['hiragana']::text[] OR lc.title ILIKE '%hiragana%' THEN 'h1'
    WHEN lc.topics @> ARRAY['katakana']::text[] OR lc.title ILIKE '%katakana%' THEN 'k1'
    WHEN lc.topics @> ARRAY['particles']::text[] OR lc.title ILIKE '%particle%' THEN 'p1'
    WHEN lc.topics @> ARRAY['verbs']::text[] OR lc.title ILIKE '%verb%' THEN 'v1'
    WHEN lc.level = 'N4' THEN 'f2'
    ELSE 'f1'
  END AS collection_id,
  lc.title,
  CONCAT('Week ', lc.week_number, ' Lesson ', lc.lesson_number) AS subtitle,
  CASE
    WHEN lc.title = 'Hiragana — あいうえお row' THEN ARRAY['あ', 'い', 'う', 'え', 'お']
    WHEN lc.title = 'Hiragana — かきくけこ row' THEN ARRAY['か', 'き', 'く', 'け', 'こ']
    WHEN lc.title = 'Katakana — アイウエオ row' THEN ARRAY['ア', 'イ', 'ウ', 'エ', 'オ']
    WHEN lc.title = 'Katakana — カキクケコ row' THEN ARRAY['カ', 'キ', 'ク', 'ケ', 'コ']
    WHEN lc.title = 'Core Particles は を に で' THEN ARRAY['は', 'を', 'に', 'で']
    ELSE ARRAY[]::text[]
  END AS characters,
  (lc.week_number * 100 + lc.lesson_number) AS sort_order,
  jsonb_build_object('topics', lc.topics, 'skill_area', lc.skill_area, 'level', lc.level) AS content,
  lc.id AS lesson_catalog_id,
  lc.level,
  lc.week_number,
  lc.lesson_number,
  lc.skill_area,
  lc.topics,
  lc.created_at
FROM public.lesson_catalog lc;

GRANT SELECT ON public.lessons TO anon, authenticated;

-- 2. Fix public.complete_lesson RPC: Update the streak increment calculations
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
  v_current_xp      integer;
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

  -- Update streak and XP
  SELECT streak, xp INTO v_streak, v_current_xp FROM profiles WHERE user_id = v_user_id;
  SELECT MAX(completed_at::date) INTO v_last_completed
    FROM lesson_progress
    WHERE user_id = v_user_id AND completed = true AND lesson_id != p_lesson_id;

  IF v_last_completed IS NULL THEN
    v_streak := 1;
  ELSIF v_last_completed = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSIF v_last_completed = v_today THEN
    -- already completed a lesson today, keep streak as is
  ELSE
    v_streak := 1;
  END IF;

  -- Update XP: score * 10 (max 1000 per lesson)
  v_current_xp := COALESCE(v_current_xp, 0) + (v_quiz_score * 10);

  -- Recalculate readiness score
  v_readiness := public.recalculate_readiness(v_user_id, v_lesson.level);

  -- Update profile
  UPDATE profiles
  SET 
    streak = v_streak, 
    xp = v_current_xp,
    readiness_score = v_readiness, 
    updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'quiz_score',   v_quiz_score,
    'streak',       v_streak,
    'xp_gained',    v_quiz_score * 10,
    'total_xp',      v_current_xp,
    'readiness',    v_readiness,
    'cards_created', (
      SELECT COUNT(*) FROM jsonb_array_elements(p_quiz_answers) AS a
      WHERE (a->>'is_correct')::boolean = false
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid, jsonb, integer) TO authenticated;

-- 3. Storage Setup for Avatars (Public Bucket & RLS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Avatar public select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar authenticated insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar authenticated update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar authenticated delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
