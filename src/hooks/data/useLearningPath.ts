import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';
import { invalidateOnboarding, invalidateRoadmap } from './invalidation';

export interface LearningPathRow {
  id: string;
  user_id: string;
  selected_level: string;
  motivation: string | null;
  hours_per_week: number | null;
  prior_experience: string | null;
  created_at: string;
  updated_at: string;
}

export function useLearningPath(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.learningPath(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: () => api.get<LearningPathRow | null>(`/api/learning-paths/${userId}`),
  });
}

export interface OnboardingPayload {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  selectedLevel: string;
  motivation: string;
  hoursPerWeek: number;
  priorExperience: string;
  examDate?: string;
  dailyGoalMinutes: number;
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardingPayload) => {
      await Promise.all([
        api.put(`/api/learning-paths/${payload.userId}`, {
          selected_level:   payload.selectedLevel,
          motivation:       payload.motivation,
          hours_per_week:   payload.hoursPerWeek,
          prior_experience: payload.priorExperience,
        }),
        api.put(`/api/profiles/${payload.userId}`, {
          ...(payload.displayName ? { display_name: payload.displayName } : {}),
          ...(payload.avatarUrl   ? { avatar_url: payload.avatarUrl }     : {}),
          current_level:        payload.selectedLevel,
          exam_date:            payload.examDate ?? null,
          daily_goal_minutes:   payload.dailyGoalMinutes,
          onboarding_completed: true,
        }),
      ]);
      return { ok: true };
    },
    onSuccess: (_data, variables) => {
      invalidateOnboarding(qc, variables.userId);
    },
  });
}

export function useLevelOverride(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (level: string) => {
      await api.put(`/api/level-overrides/${userId}`, { level });
      return { level };
    },
    onSuccess: (_data, level) => {
      invalidateRoadmap(qc, userId, level);
      qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
}

export function useLevelOverrideQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.levelOverride(userId ?? ''),
    enabled: !!userId,
    queryFn: () => api.get<{ id: string; user_id: string; level: string; confirmed_at: string } | null>(
      `/api/level-overrides/${userId}`
    ),
  });
}
