-- ============================================================
-- Migration 010: Security & Data Integrity Fixes
-- ============================================================

-- 1. Fix avatar storage RLS — scope INSERT/UPDATE/DELETE to the owning user.
--    Paths are stored as "{user_id}/{uuid}.{ext}", so the first folder segment
--    must equal the requesting user's ID.

DO $$ BEGIN
  DROP POLICY IF EXISTS "Avatar authenticated insert" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Avatar authenticated update" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Avatar authenticated delete" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar owner insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar owner update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Avatar owner delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 2. Add unique constraint on flashcards(user_id, front) to fix duplicate
--    card creation when the same wrong answer is made multiple times.
--    ON CONFLICT DO NOTHING inside complete_lesson can then use an explicit target.

DO $$ BEGIN
  ALTER TABLE public.flashcards
    ADD CONSTRAINT flashcards_user_front_unique UNIQUE (user_id, front);
EXCEPTION WHEN duplicate_table THEN NULL;
         WHEN duplicate_object THEN NULL; END $$;


-- 3. Add last_activity_date to profiles for correct streak tracking.
--    This column is updated ONLY on lesson completion, not on profile edits,
--    preventing profile saves from corrupting the streak window.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;


-- 4. Replace complete_lesson to:
--    a) use explicit conflict target for flashcard dedup
--    b) update last_activity_date instead of relying on updated_at for streak

CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_user_id    UUID,
  p_answers    JSONB,
  p_score      INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lesson_id        UUID;
  v_collection_id    UUID;
  v_level            TEXT;
  v_xp_earned        INTEGER;
  v_streak           INTEGER := 0;
  v_today            DATE    := CURRENT_DATE;
  v_last_activity    DATE;
  v_profile          RECORD;
  v_answer           JSONB;
  v_is_correct       BOOLEAN;
  v_front            TEXT;
  v_back             TEXT;
BEGIN
  -- Look up profile (xp, streak, last_activity_date, current_level)
  SELECT xp, streak, last_activity_date, current_level
    INTO v_profile
    FROM public.profiles
   WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  -- XP: 50 base + 1 per score point (capped at 150)
  v_xp_earned := LEAST(50 + p_score, 150);

  -- Streak calculation using last_activity_date
  v_last_activity := v_profile.last_activity_date;
  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    -- Reset streak if more than 1 day gap
    IF v_last_activity = v_today - INTERVAL '1 day' THEN
      v_streak := COALESCE(v_profile.streak, 0) + 1;
    ELSE
      v_streak := 1;
    END IF;
  ELSE
    -- Already studied today — keep current streak
    v_streak := COALESCE(v_profile.streak, 0);
  END IF;

  -- Update profile
  UPDATE public.profiles SET
    xp                 = COALESCE(xp, 0) + v_xp_earned,
    streak             = v_streak,
    last_activity_date = v_today,
    updated_at         = NOW()
  WHERE user_id = p_user_id;

  -- Create flashcards for wrong answers (deduped by unique constraint)
  IF p_answers IS NOT NULL THEN
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
      v_is_correct := (v_answer->>'is_correct')::boolean;
      IF NOT v_is_correct THEN
        v_front := v_answer->>'question';
        v_back  := v_answer->>'correct_answer';
        IF v_front IS NOT NULL AND v_back IS NOT NULL THEN
          INSERT INTO public.flashcards (
            user_id, front, back, review_state, ease_factor,
            interval_days, next_review_date, reviews_total, reviews_correct
          ) VALUES (
            p_user_id, v_front, v_back, 'new', 2.5,
            1, v_today, 0, 0
          )
          ON CONFLICT (user_id, front) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'xp_earned', v_xp_earned,
    'streak',    v_streak,
    'ok',        true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid, jsonb, integer) TO authenticated;
