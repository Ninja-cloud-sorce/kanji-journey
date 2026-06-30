-- Legacy compatibility views for the current SPA.
-- These views preserve older frontend expectations while lesson_catalog and
-- lesson_progress remain the canonical source of truth.

CREATE OR REPLACE VIEW public.collections AS
SELECT *
FROM (
  VALUES
    ('h1', 'Hiragana Mastery', 'The Foundation of Script', 'あ', 'Master the 46 basic characters of the Japanese phonetic script.', 'N5', 1),
    ('k1', 'Katakana Essentials', 'Foreign Loanwords', 'ア', 'Focus on the script used specifically for foreign concepts, names, and loanwords.', 'N5', 2),
    ('p1', 'Particle Logic', 'Grammatical Glue', '助', 'Decode the mystery of WA, GA, WO, and NI. The particles that hold sentences together.', 'N5', 3),
    ('v1', 'Verbal Rituals', 'Conjugation Pillars', '動', 'Master the fundamental polite and plain verb forms of the N5 level.', 'N5', 4),
    ('f1', 'The Starter Pack', 'Daily Life', '基', 'The absolute essentials for surviving daily life in Japan.', 'N5', 5),
    ('f2', 'Intermediate Pack', 'Complex Contexts', '極', 'Nuanced grammar and vocabulary for the bridge to N4.', 'N4', 6)
) AS legacy_collections(id, title, subtitle, icon, description, level, sort_order);

GRANT SELECT ON public.collections TO anon, authenticated;

CREATE OR REPLACE VIEW public.lessons AS
SELECT
  lc.id::text AS id,
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
