-- Collections and lessons are provided as compatibility views by migration 005.
-- This migration ensures grants are present and adds indexes on lesson_catalog
-- to speed up the view queries.

-- Ensure anon/authenticated can read both views
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.lessons     TO anon, authenticated;

-- Speed up collection-scoped lesson lookups used by the views
CREATE INDEX IF NOT EXISTS lesson_catalog_level_idx      ON public.lesson_catalog (level);
CREATE INDEX IF NOT EXISTS lesson_catalog_week_order_idx ON public.lesson_catalog (week_number, lesson_number);
