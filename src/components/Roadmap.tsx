import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, ChevronDown, BookOpen, Headphones, PenTool, MessageSquare } from 'lucide-react';

interface RoadmapProps {
  onNavigate: (page: string) => void;
}

const levels = [
  {
    id: 'N5',
    name: 'N5',
    title: 'Beginner',
    status: 'current',
    progress: 35,
    weeks: [
      { week: 1, title: 'Hiragana Mastery', status: 'complete' },
      { week: 2, title: 'Katakana Mastery', status: 'complete' },
      { week: 3, title: 'Basic Greetings & Particles', status: 'current' },
      { week: 4, title: 'Numbers & Counting', status: 'locked' },
      { week: 5, title: 'Basic Verbs', status: 'locked' },
      { week: 6, title: 'Adjectives & Descriptions', status: 'locked' },
      { week: 7, title: 'N5 Vocabulary Review', status: 'locked' },
      { week: 8, title: 'N5 Mock Exam', status: 'locked' },
    ],
  },
  {
    id: 'N4',
    name: 'N4',
    title: 'Elementary',
    status: 'locked',
    progress: 0,
    weeks: [],
  },
  {
    id: 'N3',
    name: 'N3',
    title: 'Intermediate',
    status: 'locked',
    progress: 0,
    weeks: [],
  },
  {
    id: 'N2',
    name: 'N2',
    title: 'Upper Intermediate',
    status: 'locked',
    progress: 0,
    weeks: [],
  },
  {
    id: 'N1',
    name: 'N1',
    title: 'Advanced',
    status: 'locked',
    progress: 0,
    weeks: [],
  },
];

const skillIcons = {
  vocab: BookOpen,
  listening: Headphones,
  writing: PenTool,
  grammar: MessageSquare,
};

export function Roadmap({ onNavigate }: RoadmapProps) {
  const [expandedLevel, setExpandedLevel] = useState<string | null>('N5');

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-light text-foreground mb-2">Your Journey</h1>
          <p className="text-muted-foreground">N5 → N1 — One level at a time</p>
        </motion.div>

        {/* Roadmap Path */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {levels.map((level, index) => {
              const isExpanded = expandedLevel === level.id;
              const isCurrent = level.status === 'current';
              const isLocked = level.status === 'locked';
              const isComplete = level.status === 'complete';

              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => !isLocked && setExpandedLevel(isExpanded ? null : level.id)}
                    disabled={isLocked}
                    className={`w-full text-left focus-calm rounded-2xl ${
                      isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className={`glass-card p-5 ${
                      isCurrent ? 'ring-2 ring-primary/30' : ''
                    } ${isLocked ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        {/* Level Badge */}
                        <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-medium ${
                          isComplete 
                            ? 'bg-success text-success-foreground' 
                            : isCurrent 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-muted-foreground'
                        }`}>
                          {isComplete ? (
                            <Check className="w-6 h-6" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <span className="font-jp">{level.name}</span>
                          )}
                        </div>

                        {/* Level Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{level.name}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{level.title}</span>
                          </div>
                          
                          {isCurrent && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{level.progress}%</span>
                              </div>
                              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${level.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand Arrow */}
                        {!isLocked && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Weeks */}
                  <AnimatePresence>
                    {isExpanded && level.weeks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 mt-2 pl-6 border-l-2 border-primary/20 space-y-2">
                          {level.weeks.map((week, weekIndex) => {
                            const weekCurrent = week.status === 'current';
                            const weekComplete = week.status === 'complete';
                            const weekLocked = week.status === 'locked';

                            return (
                              <motion.button
                                key={week.week}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: weekIndex * 0.05 }}
                                onClick={() => weekCurrent && onNavigate('practice')}
                                disabled={weekLocked}
                                className={`w-full text-left p-4 rounded-xl calm-transition focus-calm ${
                                  weekCurrent 
                                    ? 'glass-card-subtle hover:scale-[1.02]' 
                                    : weekComplete
                                      ? 'bg-success/5'
                                      : 'opacity-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    weekComplete 
                                      ? 'bg-success/20 text-success' 
                                      : weekCurrent
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-secondary text-muted-foreground'
                                  }`}>
                                    {weekComplete ? <Check className="w-3.5 h-3.5" /> : week.week}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      weekLocked ? 'text-muted-foreground' : 'text-foreground'
                                    }`}>
                                      {week.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Week {week.week}</p>
                                  </div>
                                  {weekLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
