export interface JlptLevelSpec {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  title: string;
  kanjiTarget: string;
  vocabTarget: string;
  grammarFocus: string;
  modules: Array<'kanji' | 'vocabulary' | 'grammar' | 'reading' | 'listening'>;
}

export const JLPT_CURRICULUM: JlptLevelSpec[] = [
  {
    level: 'N5',
    title: 'Foundation',
    kanjiTarget: '100 kanji',
    vocabTarget: '~800 vocab',
    grammarFocus: 'Particles, です/ます, basic verbs/adjectives',
    modules: ['kanji', 'vocabulary', 'grammar', 'reading', 'listening'],
  },
  {
    level: 'N4',
    title: 'Elementary',
    kanjiTarget: '300 kanji',
    vocabTarget: '~1,500 vocab',
    grammarFocus: 'ている, たことがある, から/ので',
    modules: ['kanji', 'vocabulary', 'grammar', 'reading', 'listening'],
  },
  {
    level: 'N3',
    title: 'Intermediate',
    kanjiTarget: '600+ kanji',
    vocabTarget: '~3,000 vocab',
    grammarFocus: 'ように, ことになっている, らしい, たばかり',
    modules: ['kanji', 'vocabulary', 'grammar', 'reading', 'listening'],
  },
  {
    level: 'N2',
    title: 'Upper Intermediate',
    kanjiTarget: '1,000+ kanji',
    vocabTarget: '~6,000 vocab',
    grammarFocus: 'Opinion, nuance, formal expression',
    modules: ['kanji', 'vocabulary', 'grammar', 'reading', 'listening'],
  },
  {
    level: 'N1',
    title: 'Advanced',
    kanjiTarget: '2,000+ kanji',
    vocabTarget: '~10,000 vocab',
    grammarFocus: 'Academic/business complexity and abstraction',
    modules: ['kanji', 'vocabulary', 'grammar', 'reading', 'listening'],
  },
];
