-- =============================================================================
-- Profile Enhancements — XP, Avatar, Bio, and more
-- =============================================================================

-- 1. Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT 'Dedicated to mastering the nuances of classical Japanese literature and advanced kanji semantics.';

-- 2. Update complete_lesson to increment XP
-- We'll add a simple logic: users get XP equal to their quiz score per completed lesson.
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

  IF v_last_completed IS NULL OR v_last_completed < v_today - INTERVAL '1 day' THEN
    -- Either first lesson or gap
    IF v_last_completed = v_today - INTERVAL '1 day' THEN
      v_streak := COALESCE(v_streak, 0) + 1;
    ELSIF v_last_completed = v_today THEN
      NULL;
    ELSE
      v_streak := 1;
    END IF;
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
