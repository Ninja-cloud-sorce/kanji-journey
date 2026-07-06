'use strict';

// Static lesson catalog mirroring migration 001_full_schema.sql seed data.
// IDs are deterministic (not UUIDs) so they remain stable across environments.
const LESSON_CATALOG = [
  { id: 'n5-w1-l1', level: 'N5', week_number: 1, lesson_number: 1, title: 'Hiragana — あいうえお row',   skill_area: 'kanji',      topics: ['hiragana','pronunciation'] },
  { id: 'n5-w1-l2', level: 'N5', week_number: 1, lesson_number: 2, title: 'Hiragana — かきくけこ row',   skill_area: 'kanji',      topics: ['hiragana','pronunciation'] },
  { id: 'n5-w2-l1', level: 'N5', week_number: 2, lesson_number: 1, title: 'Katakana — アイウエオ row',   skill_area: 'kanji',      topics: ['katakana','loanwords'] },
  { id: 'n5-w2-l2', level: 'N5', week_number: 2, lesson_number: 2, title: 'Katakana — カキクケコ row',   skill_area: 'kanji',      topics: ['katakana','loanwords'] },
  { id: 'n5-w3-l1', level: 'N5', week_number: 3, lesson_number: 1, title: 'Basic Greetings',             skill_area: 'vocabulary', topics: ['greetings','politeness'] },
  { id: 'n5-w3-l2', level: 'N5', week_number: 3, lesson_number: 2, title: 'Core Particles は を に で',  skill_area: 'grammar',    topics: ['particles','sentence structure'] },
  { id: 'n5-w4-l1', level: 'N5', week_number: 4, lesson_number: 1, title: 'Numbers 1–100',               skill_area: 'vocabulary', topics: ['numbers','counting'] },
  { id: 'n5-w4-l2', level: 'N5', week_number: 4, lesson_number: 2, title: 'Date & Time',                 skill_area: 'vocabulary', topics: ['time','calendar'] },
  { id: 'n5-w5-l1', level: 'N5', week_number: 5, lesson_number: 1, title: 'Basic い-adjectives',          skill_area: 'grammar',    topics: ['adjectives','description'] },
  { id: 'n5-w5-l2', level: 'N5', week_number: 5, lesson_number: 2, title: 'Basic な-adjectives',          skill_area: 'grammar',    topics: ['adjectives','polite forms'] },
  { id: 'n5-w6-l1', level: 'N5', week_number: 6, lesson_number: 1, title: 'Essential Verbs — Group 1',   skill_area: 'grammar',    topics: ['verbs','conjugation'] },
  { id: 'n5-w6-l2', level: 'N5', week_number: 6, lesson_number: 2, title: 'Essential Verbs — Group 2',   skill_area: 'grammar',    topics: ['verbs','て-form'] },
  { id: 'n5-w7-l1', level: 'N5', week_number: 7, lesson_number: 1, title: 'N5 Vocabulary Review',        skill_area: 'vocabulary', topics: ['review','N5 vocab'] },
  { id: 'n5-w7-l2', level: 'N5', week_number: 7, lesson_number: 2, title: 'N5 Kanji 80 — Part 1',        skill_area: 'kanji',      topics: ['kanji','stroke order'] },
  { id: 'n5-w8-l1', level: 'N5', week_number: 8, lesson_number: 1, title: 'N5 Mock Exam — Listening',    skill_area: 'listening',  topics: ['mock exam','listening'] },
  { id: 'n5-w8-l2', level: 'N5', week_number: 8, lesson_number: 2, title: 'N5 Mock Exam — Reading',      skill_area: 'reading',    topics: ['mock exam','reading'] },
  { id: 'n4-w1-l1', level: 'N4', week_number: 1, lesson_number: 1, title: 'N4 Kanji — Part 1',           skill_area: 'kanji',      topics: ['kanji','N4'] },
  { id: 'n4-w1-l2', level: 'N4', week_number: 1, lesson_number: 2, title: 'N4 Grammar — て-form uses',    skill_area: 'grammar',    topics: ['grammar','N4'] },
  { id: 'n3-w1-l1', level: 'N3', week_number: 1, lesson_number: 1, title: 'N3 Kanji — Part 1',           skill_area: 'kanji',      topics: ['kanji','N3'] },
  { id: 'n2-w1-l1', level: 'N2', week_number: 1, lesson_number: 1, title: 'N2 Grammar Overview',         skill_area: 'grammar',    topics: ['grammar','N2'] },
  { id: 'n1-w1-l1', level: 'N1', week_number: 1, lesson_number: 1, title: 'N1 Advanced Reading',         skill_area: 'reading',    topics: ['reading','N1'] },
];

// Mirror of frontend deriveLegacyCollectionId — maps each lesson to its collection
function deriveCollectionId(row) {
  const topics = row.topics ?? [];
  const title = (row.title ?? '').toLowerCase();
  if (topics.includes('hiragana') || title.includes('hiragana')) return 'h1';
  if (topics.includes('katakana') || title.includes('katakana'))  return 'k1';
  if (topics.includes('particles') || title.includes('particle'))  return 'p1';
  if (topics.includes('verbs') || title.includes('verb'))           return 'v1';
  if (row.level === 'N4' || row.level === 'N3' || row.level === 'N2' || row.level === 'N1') return 'f2';
  return 'f1';
}

const CHARACTER_PRESETS = {
  'Hiragana — あいうえお row': ['あ','い','う','え','お'],
  'Hiragana — かきくけこ row': ['か','き','く','け','こ'],
  'Katakana — アイウエオ row': ['ア','イ','ウ','エ','オ'],
  'Katakana — カキクケコ row': ['カ','キ','ク','ケ','コ'],
  'Core Particles は を に で':  ['は','を','に','で'],
};

function extractCharacters(title) {
  if (CHARACTER_PRESETS[title]) return CHARACTER_PRESETS[title];
  const matches = title.match(/[ぁ-ゖァ-ヺー一-龯々]+/g) ?? [];
  return matches.flatMap((m) => [...m]).filter(Boolean);
}

// Pre-compute derived fields for each catalog row
const CATALOG_WITH_COLLECTION = LESSON_CATALOG.map((row) => {
  const collection_id = deriveCollectionId(row);
  return {
    ...row,
    collection_id,
    lesson_catalog_id: row.id,
    subtitle: `Week ${row.week_number} Lesson ${row.lesson_number}`,
    characters: extractCharacters(row.title),
    sort_order: row.week_number * 100 + row.lesson_number,
    content: { topics: row.topics, skill_area: row.skill_area, level: row.level },
  };
});

// Static collections (mirrors LEGACY_COLLECTIONS from frontend)
const COLLECTIONS = [
  { id: 'h1', title: 'Hiragana Mastery',     subtitle: 'The Foundation of Script', icon: 'あ', description: 'Master the 46 basic characters of the Japanese phonetic script.',                               level: 'N5', sort_order: 1 },
  { id: 'k1', title: 'Katakana Essentials',  subtitle: 'Foreign Loanwords',        icon: 'ア', description: 'Focus on the script used specifically for foreign concepts, names, and loanwords.',             level: 'N5', sort_order: 2 },
  { id: 'p1', title: 'Particle Logic',       subtitle: 'Grammatical Glue',         icon: '助', description: 'Decode the mystery of WA, GA, WO, and NI. The particles that hold sentences together.',       level: 'N5', sort_order: 3 },
  { id: 'v1', title: 'Verbal Rituals',       subtitle: 'Conjugation Pillars',      icon: '動', description: 'Master the fundamental polite and plain verb forms of the N5 level.',                           level: 'N5', sort_order: 4 },
  { id: 'f1', title: 'The Starter Pack',     subtitle: 'Daily Life',               icon: '基', description: 'The absolute essentials for surviving daily life in Japan.',                                    level: 'N5', sort_order: 5 },
  { id: 'f2', title: 'Intermediate Pack',    subtitle: 'Complex Contexts',         icon: '極', description: 'Nuanced grammar and vocabulary for the bridge to N4.',                                          level: 'N4', sort_order: 6 },
];

// Lessons per collection for progress computation
function getLessonsByCollection(collectionId) {
  return CATALOG_WITH_COLLECTION.filter((l) => l.collection_id === collectionId);
}

function getLessonById(lessonId) {
  return CATALOG_WITH_COLLECTION.find((l) => l.id === lessonId) ?? null;
}

function getLessonsByLevel(level) {
  return CATALOG_WITH_COLLECTION.filter((l) => l.level === level);
}

module.exports = { LESSON_CATALOG, CATALOG_WITH_COLLECTION, COLLECTIONS, getLessonsByCollection, getLessonById, getLessonsByLevel, deriveCollectionId };
