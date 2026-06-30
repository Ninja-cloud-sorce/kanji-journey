-- Compatibility layer for clients expecting a Firebase-like `questions` shape.
-- Keeps existing practice_questions table as source of truth.

ALTER TABLE public.practice_questions
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'medium'
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

CREATE OR REPLACE VIEW public.questions AS
SELECT
  id,
  level AS jlpt_level,
  topic,
  concat(prompt, ' ', display_text) AS question,
  options,
  options[correct_index + 1] AS correct_answer,
  explanation,
  difficulty
FROM public.practice_questions;

GRANT SELECT ON public.questions TO anon, authenticated;
