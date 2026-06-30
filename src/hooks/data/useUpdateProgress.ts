import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      level, 
      score, 
      mistakes,
      lessonId 
    }: { 
      userId: string, 
      level: string, 
      score: number, 
      mistakes?: string[],
      lessonId?: string
    }) => {
      // 1. Fetch current user data for context
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      const currentXP = Number(profile?.xp ?? 0);
      const currentStreak = Number(profile?.streak ?? 0);
      const currentReadiness = Number(profile?.readiness_score ?? 0);
      
      // Calculate XP Gain (Base 50 + score bonus)
      const xpGain = Math.round(50 + (score * 0.5));
      const nextXP = currentXP + xpGain;
      
      // Calculate Readiness (Smoothing)
      const nextReadiness = Math.round((currentReadiness * 0.7) + (score * 0.3));

      // 2. Handle Streak Logic
      let nextStreak = currentStreak;
      const lastUpdated = profile?.updated_at ? new Date(profile.updated_at) : null;
      const now = new Date();
      
      if (lastUpdated) {
        const diffInHours = Math.abs(now.getTime() - lastUpdated.getTime()) / 36e5;
        if (diffInHours > 24 && diffInHours < 48) {
          nextStreak += 1; // Increment streak if one day passed
        } else if (diffInHours >= 48) {
          nextStreak = 1; // Reset if they missed a day
        }
      } else {
        nextStreak = 1; // First session ever
      }

      // 3. Update Profiles Table
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ 
          current_level: level, 
          readiness_score: Math.min(100, Math.max(0, nextReadiness)),
          xp: nextXP,
          streak: nextStreak,
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);

      if (updateErr) throw updateErr;

      // 4. Mark specific lesson as completed if IDs are provided
      if (lessonId && userId) {
        await supabase
          .from('lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            completed_at: now.toISOString(),
            quiz_score: score,
            level: level,
            week_number: 1 // Default if unknown
          }, { onConflict: 'user_id,lesson_id' });
      }

      // 5. Update Weak Topics if mistakes were made
      if (mistakes && mistakes.length > 0) {
        const payload = mistakes.map((topic) => ({
          user_id: userId,
          topic,
          skill_area: topic, // Using topic as area for now
          mistakes_count: 1,
          last_seen_at: now.toISOString(),
        }));

        await supabase.from('weak_topics').upsert(payload as any, {
          onConflict: 'user_id,topic,skill_area',
          ignoreDuplicates: false,
        });
      }

      return { nextXP, xpGain, nextStreak };
    },
    onSuccess: (_, variables) => {
      // Global invalidation to ensure UI reflects new points/progress
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['readiness', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['weakTopics', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
}
