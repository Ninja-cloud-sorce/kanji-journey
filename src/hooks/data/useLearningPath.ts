import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';
import { invalidateOnboarding, invalidateRoadmap } from './invalidation';

/**
 * useLearningPath — fetches the user's onboarding/learning_paths row.
 */
export function useLearningPath(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.learningPath(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export interface OnboardingPayload {
  userId: string;
  selectedLevel: string;
  motivation: string;
  hoursPerWeek: number;
  priorExperience: string;
  examDate?: string;
  dailyGoalMinutes: number;
}

/**
 * useCompleteOnboarding — sends onboarding results to the centralized API.
 */
export function useCompleteOnboarding() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OnboardingPayload) => {
      const { error: pathErr } = await supabase
        .from('learning_paths')
        .upsert({
          user_id: payload.userId,
          selected_level: payload.selectedLevel,
          motivation: payload.motivation,
          hours_per_week: payload.hoursPerWeek,
          prior_experience: payload.priorExperience,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (pathErr) throw pathErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          current_level: payload.selectedLevel,
          exam_date: payload.examDate ?? null,
          daily_goal_minutes: payload.dailyGoalMinutes as any,
          onboarding_completed: true as any,
        })
        .eq('user_id', payload.userId);

      if (profileErr) throw profileErr;
      return { ok: true };
    },
    onSuccess: (_data, variables) => {
      invalidateOnboarding(qc, variables.userId);
    },
  });
}

/**
 * useLevelOverride — performs a Roadmap-level jump via the centralized API.
 */
export function useLevelOverride(userId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (level: string) => {
      const { error: overrideErr } = await supabase
        .from('level_overrides')
        .upsert({
          user_id: userId,
          level,
          confirmed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (overrideErr) throw overrideErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ current_level: level })
        .eq('user_id', userId);

      if (profileErr) throw profileErr;
      return { level };
    },
    onSuccess: (_data, level) => {
      invalidateRoadmap(qc, userId, level);
      // Also refetch profile for current_level display
      qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
}

/**
 * useLevelOverrideQuery — reads the stored level override.
 */
export function useLevelOverrideQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.levelOverride(userId ?? ''),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('level_overrides')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
