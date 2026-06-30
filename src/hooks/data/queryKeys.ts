/**
 * queryKeys — stable, typed query key factory for all React Query hooks.
 * All cache invalidations must reference these keys.
 */
export const queryKeys = {
  // Profile
  profile: (userId: string) => ['profile', userId] as const,

  // Weak topics (ordered by mistakes_count desc)
  weakTopics: (userId: string) => ['weakTopics', userId] as const,

  // Flashcards due today
  flashcardsDue: (userId: string, collectionId?: string | null) =>
    ['flashcardsDue', userId, collectionId ?? 'all'] as const,

  // All flashcards
  flashcards: (userId: string) => ['flashcards', userId] as const,

  // Next incomplete lesson for a given level
  nextLesson: (userId: string, level: string) => ['nextLesson', userId, level] as const,

  // Lesson catalog for a level
  lessonCatalog: (level: string) => ['lessonCatalog', level] as const,

  // All lesson progress for a user + level
  lessonProgress: (userId: string, level: string) => ['lessonProgress', userId, level] as const,

  // Quiz history (recent attempts)
  quizHistory: (userId: string) => ['quizHistory', userId] as const,

  // Learning path (onboarding answers)
  learningPath: (userId: string) => ['learningPath', userId] as const,

  // Level override
  levelOverride: (userId: string) => ['levelOverride', userId] as const,

  // Practice questions
  practiceQuestions: (level: string, topic: string, count: number) =>
    ['practiceQuestions', level, topic, count] as const,

  // Exam simulator section questions
  examQuestions: (level: string, section: string) =>
    ['examQuestions', level, section] as const,

  // Full generated exam payload
  generatedExam: (level: string) => ['generatedExam', level] as const,
} as const;
