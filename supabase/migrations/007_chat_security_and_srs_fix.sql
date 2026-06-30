-- =============================================================================
-- Chat Security and SRS Review Accounting
-- =============================================================================

-- Persisted chat history used by the SPA. RLS keeps every user's transcript
-- isolated while still allowing the current client-side persistence flow.
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text NOT NULL CHECK (char_length(content) <= 8000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages (user_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "chat_messages_select_own"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "chat_messages_insert_own"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "chat_messages_delete_own"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;

-- Replace the earlier SRS RPC with stricter validation and atomic accounting.
CREATE OR REPLACE FUNCTION public.review_flashcard(
  p_card_id  uuid,
  p_grade    integer
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
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_grade < 0 OR p_grade > 5 THEN
    RAISE EXCEPTION 'Grade must be between 0 and 5';
  END IF;

  SELECT * INTO v_card
  FROM flashcards
  WHERE id = p_card_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flashcard not found or access denied';
  END IF;

  v_ef       := v_card.ease_factor;
  v_interval := v_card.interval_days;

  IF p_grade >= 3 THEN
    IF v_card.review_state = 'new' OR v_card.review_state = 'learning' THEN
      v_interval := 1;
    ELSIF v_interval = 1 THEN
      v_interval := 6;
    ELSE
      v_interval := ROUND(v_interval * v_ef);
    END IF;

    v_ef := GREATEST(1.3, v_ef + (0.1 - (5 - p_grade) * (0.08 + (5 - p_grade) * 0.02)));
    v_state := 'review';
  ELSE
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
    reviews_total    = COALESCE(reviews_total, 0) + 1,
    reviews_correct  = COALESCE(reviews_correct, 0) + CASE WHEN p_grade >= 3 THEN 1 ELSE 0 END,
    updated_at       = now()
  WHERE id = p_card_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'interval_days',    v_interval,
    'ease_factor',      v_ef,
    'review_state',     v_state,
    'next_review_date', v_next_date
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.review_flashcard(uuid, integer) TO authenticated;
