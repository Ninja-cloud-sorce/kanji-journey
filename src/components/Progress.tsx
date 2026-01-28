import { motion } from 'framer-motion';
import { Flame, BookOpen, Headphones, PenTool, MessageSquare, TrendingUp } from 'lucide-react';

interface ProgressProps {
  onNavigate: (page: string) => void;
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const weekActivity = [true, true, true, false, true, true, false]; // This week's activity

const skills = [
  { name: 'Vocabulary', icon: BookOpen, score: 72, color: 'text-primary' },
  { name: 'Grammar', icon: MessageSquare, score: 58, color: 'text-accent' },
  { name: 'Listening', icon: Headphones, score: 45, color: 'text-warning' },
  { name: 'Reading', icon: PenTool, score: 65, color: 'text-success' },
];

export function Progress({ onNavigate }: ProgressProps) {
  const streakDays = 12;
  const readinessScore = 62;

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-light text-foreground mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Keep building your streak</p>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-streak/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-streak" />
              </div>
              <div>
                <p className="text-3xl font-light text-foreground">{streakDays}</p>
                <p className="text-sm text-muted-foreground">day streak</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Personal best: 18</p>
          </div>

          {/* Week View */}
          <div className="flex justify-between">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{day}</span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center calm-transition ${
                    weekActivity[index]
                      ? 'bg-streak/20'
                      : 'bg-secondary'
                  }`}
                >
                  {weekActivity[index] && (
                    <Flame className="w-4 h-4 text-streak" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="font-medium text-foreground">N5 Readiness</p>
          </div>
          
          <div className="flex items-end gap-4">
            <p className="text-5xl font-light text-foreground">{readinessScore}%</p>
            <p className="text-sm text-muted-foreground mb-2">
              {readinessScore >= 80 ? 'Ready!' : readinessScore >= 60 ? 'Almost there' : 'Keep practicing'}
            </p>
          </div>

          <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${readinessScore}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </motion.div>

        {/* Skill Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <p className="font-medium text-foreground mb-4">Skill Breakdown</p>
          
          <div className="space-y-4">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${skill.color}`} />
                      <span className="text-sm text-foreground">{skill.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{skill.score}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-subtle p-5"
        >
          <p className="text-sm font-medium text-foreground mb-2">Focus Areas</p>
          <p className="text-sm text-muted-foreground">
            Based on recent quizzes, practice more on <span className="text-foreground">particles</span> and <span className="text-foreground">verb conjugation</span>.
          </p>
          <button
            onClick={() => onNavigate('practice')}
            className="mt-3 text-sm text-primary font-medium"
          >
            Practice weak areas →
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
