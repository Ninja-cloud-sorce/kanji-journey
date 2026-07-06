/**
 * invalidation — shared React Query cache invalidation helpers.
 *
 * These functions are called after mutations to ensure the UI re-fetches
 * only the stale slices of data, not everything.
 */
import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/** Called after onboarding completes — refresh profile + learning path */
export function invalidateOnboarding(qc: QueryClient, userId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.learningPath(userId) });
}

/** Called after a lesson completes — refresh progress, streak, flashcards, weak topics */
export function invalidateLessonCompletion(qc: QueryClient, userId: string, level: string) {
  qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.lessonProgress(userId, level) });
  qc.invalidateQueries({ queryKey: queryKeys.nextLesson(userId, level) });
  qc.invalidateQueries({ queryKey: queryKeys.quizHistory(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.weakTopics(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.flashcardsDue(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.collections(userId) });
}

/** Called after a flashcard review */
export function invalidateFlashcardReview(qc: QueryClient, userId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.flashcardsDue(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.profile(userId) }); // readiness may change
}

/** Called after sign-out — nuke everything */
export function invalidateAll(qc: QueryClient) {
  qc.clear();
}

/** Called after settings save */
export function invalidateProfile(qc: QueryClient, userId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
}

/** Called after roadmap level override */
export function invalidateRoadmap(qc: QueryClient, userId: string, level: string) {
  qc.invalidateQueries({ queryKey: queryKeys.levelOverride(userId) });
  qc.invalidateQueries({ queryKey: queryKeys.lessonProgress(userId, level) });
  qc.invalidateQueries({ queryKey: queryKeys.nextLesson(userId, level) });
}
