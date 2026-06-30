import n5Data from './jlpt_n5.json';

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export const getN5Vocabulary = (limit: number = 20) => {
  return [
    { id: 'v1', word: '学校', reading: 'がっこう', meaning: 'School', level: 'N5' },
    { id: 'v2', word: '先生', reading: 'せんせい', meaning: 'Teacher', level: 'N5' },
    { id: 'v3', word: '学生', reading: 'がくせい', meaning: 'Student', level: 'N5' },
    { id: 'v4', word: '昨日', reading: 'きのう', meaning: 'Yesterday', level: 'N5' },
    { id: 'v5', word: '明日', reading: 'あした', meaning: 'Tomorrow', level: 'N5' },
    { id: 'v6', word: '友達', reading: 'ともだち', meaning: 'Friend', level: 'N5' },
    { id: 'v7', word: '本屋', reading: 'ほんや', meaning: 'Bookstore', level: 'N5' },
    { id: 'v8', word: '映画', reading: 'えいが', meaning: 'Movie', level: 'N5' },
    { id: 'v9', word: '食べる', reading: 'たべる', meaning: 'To eat', level: 'N5' },
    { id: 'v10', word: '見る', reading: 'みる', meaning: 'To see', level: 'N5' }
  ].slice(0, limit);
};

export const getN5Grammar = () => {
  return [
    { id: 'g1', pattern: '〜は〜です', meaning: 'A is B (polite copula)', level: 'N5' },
    { id: 'g2', pattern: '〜は〜じゃありません', meaning: 'A is not B', level: 'N5' },
    { id: 'g3', pattern: '〜がほしい', meaning: 'To want something', level: 'N5' },
    { id: 'g4', pattern: '〜たいです', meaning: 'To want to do something', level: 'N5' },
    { id: 'g5', pattern: '〜てください', meaning: 'Please do...', level: 'N5' }
  ];
};

export const getN5Kanji = () => {
  return [
    { id: 'k1', char: '日', meaning: 'Day/Sun', on: 'NICHI', kun: 'hi', level: 'N5' },
    { id: 'k2', char: '本', meaning: 'Book/Origin', on: 'HON', kun: 'moto', level: 'N5' },
    { id: 'k3', char: '人', meaning: 'Person', on: 'JIN', kun: 'hito', level: 'N5' },
    { id: 'k4', char: '山', meaning: 'Mountain', on: 'SAN', kun: 'yama', level: 'N5' },
    { id: 'k5', char: '川', meaning: 'River', on: 'SEN', kun: 'kawa', level: 'N5' }
  ];
};

export const getPracticeQuestions = (level: string, count: number = 10, topic?: string) => {
  if (level === 'N5') {
    let questions = [...n5Data.jlpt_n5_important_questions.quizzes];
    if (topic && topic !== 'all') {
      const topicMap: any = { 'kanji': 'kanji_reading', 'vocabulary': 'vocabulary', 'grammar': 'grammar', 'reading': 'reading' };
      const targetTopic = topicMap[topic] || topic;
      questions = questions.filter(q => q.topic === targetTopic);
    }
    // Shuffle
    questions = questions.sort(() => Math.random() - 0.5);
    return questions.slice(0, count);
  }
  return [];
};

export const getLevelCurriculum = (level: string) => {
  if (level === 'N5') {
    return {
      vocabulary: getN5Vocabulary(),
      grammar: getN5Grammar(),
      kanji: getN5Kanji(),
      progress: 35
    };
  }
  return null;
};
