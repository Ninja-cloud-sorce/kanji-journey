import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ExamCountdown } from './ExamCountdown';
import { StreakBadge } from './StreakBadge';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // Mock data - would come from Firebase
  const userData = {
    name: 'Learner',
    currentLevel: 'N5',
    streak: 12,
    examDate: new Date('2025-07-06'), // JLPT exam date
    todayProgress: 0,
    currentLesson: 'Hiragana: は行',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto space-y-6"
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-light text-foreground">
            {getGreeting()}.
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">
              Continue your <span className="font-medium text-foreground">{userData.currentLevel}</span> journey
            </p>
            <StreakBadge days={userData.streak} />
          </div>
        </motion.div>

        {/* Exam Countdown */}
        <ExamCountdown 
          examDate={userData.examDate} 
          level={userData.currentLevel} 
        />

        {/* Today's Lesson Card - Primary CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('practice')}
          className="w-full glass-card p-6 text-left group calm-transition hover:scale-[1.02] active:scale-[0.98] focus-calm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Today's Focus</span>
              </div>
              
              <div>
                <p className="text-lg font-medium text-foreground mb-1">
                  {userData.currentLesson}
                </p>
                <p className="text-sm text-muted-foreground">
                  Continue where you left off
                </p>
              </div>
            </div>

            <motion.div
              className="mt-2 p-3 rounded-full bg-primary text-primary-foreground"
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Today's progress</span>
              <span>0 / 3 lessons</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userData.todayProgress}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.button>

        {/* Secondary Link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onNavigate('roadmap')}
          className="w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground calm-transition focus-calm rounded-lg"
        >
          View full roadmap →
        </motion.button>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8 text-center"
        >
          <p className="font-jp text-lg text-muted-foreground/60">
            一歩一歩
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Step by step
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
