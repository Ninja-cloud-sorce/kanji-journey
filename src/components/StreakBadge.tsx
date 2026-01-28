import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-streak/15"
    >
      <Flame className="w-4 h-4 text-streak" />
      <span className="text-sm font-medium text-streak">{days} day streak</span>
    </motion.div>
  );
}
