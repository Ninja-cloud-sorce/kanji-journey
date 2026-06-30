export interface KanaExample {
  word: string;
  translation: string;
}

export const KANA_EXAMPLES: Record<string, KanaExample> = {
  'あ': { word: 'あめ', translation: 'rain' },
  'い': { word: 'いす', translation: 'chair' },
  'う': { word: 'うみ', translation: 'sea' },
  'え': { word: 'えき', translation: 'station' },
  'お': { word: 'おか', translation: 'hill' },
  'か': { word: 'かさ', translation: 'umbrella' },
  'き': { word: 'き', translation: 'tree' },
  'く': { word: 'くつ', translation: 'shoes' },
  'け': { word: 'けしゴム', translation: 'eraser' },
  'こ': { word: 'こども', translation: 'child' },
  'ア': { word: 'アメリカ', translation: 'America' },
  'イ': { word: 'イギリス', translation: 'England' },
  'ウ': { word: 'ウサギ', translation: 'rabbit' },
  'エ': { word: 'エレベーター', translation: 'elevator' },
  'オ': { word: 'オレンジ', translation: 'orange' },
  'カ': { word: 'カメラ', translation: 'camera' },
  'キ': { word: 'キッチン', translation: 'kitchen' },
  'ク': { word: 'クラス', translation: 'class' },
  'ケ': { word: 'ケーキ', translation: 'cake' },
  'コ': { word: 'コーヒー', translation: 'coffee' },
};
