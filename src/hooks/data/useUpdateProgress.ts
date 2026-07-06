import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';

interface UpdateProgressPayload {
  userId: string;
  level: string;
  score: number;
  mistakes?: string[];
  lessonId?: string;
}

interface ProfileLike {
  xp?: number;
  streak?: number;
  readiness_score?: number;
  updated_at?: string;
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, level, score, mistakes, lessonId }: UpdateProgressPayload) => {
      // Fetch current profile to compute XP, streak, readiness
      const profile = await api.get<ProfileLike>(`/api/profiles/${userId}`);

      const currentXP        = Number(profile?.xp ?? 0);
      const currentStreak    = Number(profile?.streak ?? 0);
      const currentReadiness = Number(profile?.readiness_score ?? 0);

      const xpGain      = Math.round(50 + score * 0.5);
      const nextXP      = currentXP + xpGain;
      const nextReadiness = Math.round(currentReadiness * 0.7 + score * 0.3);

      // Streak: the API-side complete-lesson handles streak precisely via last_activity_date.
      // For general progress updates (reading, vocab quiz) we just use updated_at heuristic.
      const lastUpdated = profile?.updated_at ? new Date(profile.updated_at) : null;
      const now = new Date();
      let nextStreak = currentStreak;
      if (lastUpdated) {
        const diffHours = Math.abs(now.getTime() - lastUpdated.getTime()) / 3_600_000;
        if (diffHours > 24 && diffHours < 48) nextStreak = currentStreak + 1;
        else if (diffHours >= 48)             nextStreak = 1;
      } else {
        nextStreak = 1;
      }

      // Update profile
      await api.put(`/api/profiles/${userId}`, {
        current_level:   level,
        readiness_score: Math.min(100, Math.max(0, nextReadiness)),
        xp:              nextXP,
        streak:          nextStreak,
        updated_at:      now.toISOString(),
      });

      // Mark lesson as completed if lessonId provided
      if (lessonId) {
        await api.post('/api/lesson-progress', {
          user_id:        userId,
          lesson_id:      lessonId,
          level,
          week_number:    1,
          completed:      true,
          completed_at:   now.toISOString(),
          quiz_score:     score,
          time_spent_sec: 0,
        });
      }

      // Upsert weak topics if mistakes provided
      if (mistakes && mistakes.length > 0) {
        const items = mistakes.map((topic) => ({
          user_id:        userId,
          topic,
          skill_area:     topic,
          mistakes_count: 1,
          last_seen_at:   now.toISOString(),
        }));
        await api.post('/api/weak-topics/batch', { items });
      }

      return { nextXP, xpGain, nextStreak };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.weakTopics(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons('', variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections(variables.userId) });
    },
  });
}
