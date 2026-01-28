import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface ExamCountdownProps {
  examDate: Date;
  level: string;
}

export function ExamCountdown({ examDate, level }: ExamCountdownProps) {
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card-subtle p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">JLPT {level} Exam</p>
          <p className="text-3xl font-light text-foreground">
            <span className="font-medium">{daysLeft}</span>
            <span className="text-lg ml-1">days left</span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(examDate)}</span>
          </div>
        </div>
        
        <div className="relative">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-secondary"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-primary"
              strokeWidth="2"
              strokeDasharray={`${Math.min(100, (1 - daysLeft / 180) * 100)} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{level}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
