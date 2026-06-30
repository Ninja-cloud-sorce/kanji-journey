-- Dynamic question bank for Practice + Exam Simulator
CREATE TABLE IF NOT EXISTS public.practice_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level           text NOT NULL CHECK (level IN ('N5','N4','N3','N2','N1')),
  topic           text NOT NULL CHECK (topic IN ('kanji','vocabulary','grammar','reading','listening')),
  section         text NOT NULL CHECK (section IN ('vocabulary','grammar','reading','listening')),
  prompt          text NOT NULL,
  display_text    text NOT NULL,
  options         text[] NOT NULL CHECK (array_length(options, 1) = 4),
  correct_index   integer NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation     text,
  is_exam_ready   boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_questions_level_topic
  ON public.practice_questions (level, topic);

CREATE INDEX IF NOT EXISTS idx_practice_questions_level_section
  ON public.practice_questions (level, section, is_exam_ready);

-- Public read-only curriculum content
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "practice_questions_select_all"
    ON public.practice_questions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed a baseline N5 set so dynamic flows work out of the box
INSERT INTO public.practice_questions
  (level, topic, section, prompt, display_text, options, correct_index, explanation, is_exam_ready)
VALUES
  ('N5','kanji','vocabulary','What is the reading of this kanji?','水','{"みず","ひ","き","やま"}',0,'水 is read みず.', true),
  ('N5','kanji','vocabulary','What does this kanji mean?','山','{"river","mountain","tree","fire"}',1,'山 means mountain.', true),
  ('N5','vocabulary','vocabulary','What does this phrase mean?','おはようございます','{"Good night","Good morning","Thank you","Goodbye"}',1,'Standard greeting in the morning.', true),
  ('N5','vocabulary','vocabulary','Choose the correct meaning.','ありがとう','{"Sorry","Hello","Thank you","Please"}',2,'ありがとう means thank you.', true),
  ('N5','grammar','grammar','Fill in the blank: 私___学生です。','私___学生です。','{"は","を","に","で"}',0,'Topic marker は.', true),
  ('N5','grammar','grammar','Fill in the blank: 学校___行きます。','学校___行きます。','{"は","が","に","の"}',2,'Destination particle に.', true),
  ('N5','reading','reading','Choose the best interpretation.','わたしはまいにちがっこうへいきます。','{"I go to school every day.","I went to school yesterday.","I will go to school tomorrow.","I never go to school."}',0,'まいにち = every day.', true),
  ('N5','reading','reading','Choose the best interpretation.','これはほんです。','{"This is a pen.","This is a book.","That is a book.","This is a notebook."}',1,'ほん = book.', true),
  ('N5','listening','listening','Listening placeholder: choose likely reply.','はい、わかりました。','{"I don''t understand.","Yes, understood.","Please repeat.","Where are you?"}',1,'わかりました = understood.', true),
  ('N5','listening','listening','Listening placeholder: choose likely meaning.','もういちど おねがいします。','{"Nice to meet you.","Please sit down.","One more time, please.","Thank you very much."}',2,'もういちど = one more time.', true)
ON CONFLICT DO NOTHING;
