import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, Clock, Bell, ChevronRight, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface SettingsProps {
  onNavigate: (page: string) => void;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

export function Settings({ onNavigate, profile, updateProfile }: SettingsProps) {
  // Initialize from Supabase profile data
  const [examDate, setExamDate] = useState(
    profile.exam_date ? new Date(profile.exam_date).toISOString().split('T')[0] : ''
  );
  const [targetLevel, setTargetLevel] = useState(profile.current_level);
  const [dailyGoal, setDailyGoal] = useState(15);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const goalOptions = [10, 15, 20, 30, 45, 60];

  // Save changes to Supabase when user modifies settings
  const handleSave = async (updates: Partial<Profile>) => {
    setSaving(true);
    await updateProfile(updates);
    setSaving(false);
  };

  const handleLevelChange = (level: string) => {
    setTargetLevel(level);
    handleSave({ current_level: level });
  };

  const handleExamDateChange = (date: string) => {
    setExamDate(date);
    handleSave({ exam_date: date ? new Date(date).toISOString() : null });
  };

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
          {saving && (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Saving...</span>
            </div>
          )}
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
                onClick={() => handleLevelChange(level)}
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
            onChange={(e) => handleExamDateChange(e.target.value)}
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
              <p className="text-sm text-muted-foreground">{profile.learning_path || 'JLPT Exam-Oriented'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
