import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, Clock, Bell, ChevronRight } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const [examDate, setExamDate] = useState('2025-07-06');
  const [targetLevel, setTargetLevel] = useState('N5');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [notifications, setNotifications] = useState(true);

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const goalOptions = [10, 15, 20, 30, 45, 60];

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
          <h1 className="text-2xl font-light text-foreground mb-2">Exam Settings</h1>
          <p className="text-muted-foreground">Customize your JLPT journey</p>
        </motion.div>

        {/* Target Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <p className="font-medium text-foreground">Target Level</p>
          </div>
          
          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setTargetLevel(level)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm calm-transition focus-calm ${
                  targetLevel === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Exam Date */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="font-medium text-foreground">Exam Date</p>
          </div>
          
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <p className="text-xs text-muted-foreground mt-2">
            JLPT exams are held in July and December each year.
          </p>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <p className="font-medium text-foreground">Daily Goal</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className={`py-3 rounded-xl text-sm calm-transition focus-calm ${
                  dailyGoal === goal
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {goal} min
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Reminders</p>
                <p className="text-sm text-muted-foreground">Daily study notifications</p>
              </div>
            </div>
            
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-7 rounded-full calm-transition ${
                notifications ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <motion.div
                animate={{ x: notifications ? 22 : 4 }}
                className="w-5 h-5 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>
        </motion.div>

        {/* Learning Path */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full glass-card-subtle p-5 text-left focus-calm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Learning Path</p>
              <p className="text-sm text-muted-foreground">JLPT Exam-Oriented</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
