import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, BookOpen, Clock, Target, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { useCompleteOnboarding } from '@/hooks/data/useLearningPath';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const MOTIVATION_OPTIONS = [
  { id: 'exam', label: 'Pass JLPT exam', emoji: '📜' },
  { id: 'travel', label: 'Travel to Japan', emoji: '✈️' },
  { id: 'anime', label: 'Enjoy anime/manga', emoji: '🎌' },
  { id: 'work', label: 'Career / business', emoji: '💼' },
  { id: 'culture', label: 'Love the culture', emoji: '⛩️' },
  { id: 'other', label: 'Other', emoji: '🌸' },
];
const HOURS_OPTIONS = [1, 3, 5, 7, 10];
const GOAL_OPTIONS = [10, 15, 20, 30, 45, 60];
const EXPERIENCE_OPTIONS = [
  { id: 'none', label: 'Complete beginner', desc: 'Never studied Japanese' },
  { id: 'hiragana', label: 'Know kana', desc: 'Can read hiragana / katakana' },
  { id: 'basic', label: 'Basic vocabulary', desc: 'Know some N5 words' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Studied for 1+ year' },
];

type Step = 'level' | 'motivation' | 'experience' | 'schedule' | 'examDate';

const STEPS: Step[] = ['level', 'motivation', 'experience', 'schedule', 'examDate'];

/**
 * Onboarding — multi-step form shown once before the main dashboard.
 *
 * On completion it:
 *   1. Inserts a learning_paths row with the answers
 *   2. Updates profiles.current_level, .exam_date, .daily_goal_minutes, .onboarding_completed
 */
export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [dailyGoal, setDailyGoal] = useState(15);
  const [examDate, setExamDate] = useState('');

  const { toast } = useToast();
  const completeOnboarding = useCompleteOnboarding();
  const currentStep = STEPS[stepIndex];

  const canAdvance = () => {
    if (currentStep === 'level') return !!selectedLevel;
    if (currentStep === 'motivation') return !!motivation;
    if (currentStep === 'experience') return !!experience;
    if (currentStep === 'schedule') return !!hoursPerWeek && !!dailyGoal;
    if (currentStep === 'examDate') return true; // optional
    return true;
  };

  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    // Last step — save to Supabase
    try {
      await completeOnboarding.mutateAsync({
        userId,
        selectedLevel,
        motivation,
        hoursPerWeek,
        priorExperience: experience,
        examDate: examDate || undefined,
        dailyGoalMinutes: dailyGoal,
      });
      onComplete();
    } catch (err: any) {
      toast({ title: 'Error saving preferences', description: err.message, variant: 'destructive' });
    }
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo + progress bar */}
        <div className="text-center space-y-4">
          <Logo size="large" />
          <div className="flex gap-1.5 justify-center">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full calm-transition ${
                  idx <= stepIndex ? 'bg-primary w-8' : 'bg-secondary w-4'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Step {stepIndex + 1} of {STEPS.length}</p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-6 space-y-5"
          >
            {/* LEVEL */}
            {currentStep === 'level' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <Target className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Your target level</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll start at N5 by default. You can jump to a higher level on the roadmap later.
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {JLPT_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      id={`level-btn-${lvl}`}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-3 rounded-xl font-medium text-sm calm-transition focus-calm ${
                        selectedLevel === lvl
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* MOTIVATION */}
            {currentStep === 'motivation' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Why are you learning?</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MOTIVATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      id={`motivation-btn-${opt.id}`}
                      onClick={() => setMotivation(opt.id)}
                      className={`p-3 rounded-xl text-left calm-transition focus-calm ${
                        motivation === opt.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span className="block text-xl mb-1">{opt.emoji}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* EXPERIENCE */}
            {currentStep === 'experience' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Prior experience</h2>
                </div>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      id={`exp-btn-${opt.id}`}
                      onClick={() => setExperience(opt.id)}
                      className={`w-full p-4 rounded-xl text-left calm-transition focus-calm ${
                        experience === opt.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className={`text-xs mt-0.5 ${experience === opt.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* SCHEDULE */}
            {currentStep === 'schedule' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Your schedule</h2>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Hours per week</p>
                  <div className="flex gap-2">
                    {HOURS_OPTIONS.map((h) => (
                      <button
                        key={h}
                        id={`hours-btn-${h}`}
                        onClick={() => setHoursPerWeek(h)}
                        className={`flex-1 py-2.5 rounded-xl text-sm calm-transition focus-calm ${
                          hoursPerWeek === h
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Daily goal</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GOAL_OPTIONS.map((g) => (
                      <button
                        key={g}
                        id={`goal-btn-${g}`}
                        onClick={() => setDailyGoal(g)}
                        className={`py-3 rounded-xl text-sm calm-transition focus-calm ${
                          dailyGoal === g
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {g} min
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* EXAM DATE */}
            {currentStep === 'examDate' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Exam date</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  JLPT is held in July and December. Setting a date enables the countdown timer.
                </p>
                <input
                  id="exam-date-input"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">Optional — you can set this later in Settings.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <button
              id="onboarding-back-btn"
              onClick={handleBack}
              className="p-3 rounded-xl bg-secondary text-foreground calm-transition hover:bg-secondary/80 focus-calm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            id="onboarding-next-btn"
            onClick={handleNext}
            disabled={!canAdvance() || completeOnboarding.isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 calm-transition hover:opacity-90 focus-calm disabled:opacity-50"
          >
            {completeOnboarding.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{stepIndex === STEPS.length - 1 ? 'Start Learning' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Skip exam date */}
        {currentStep === 'examDate' && !completeOnboarding.isPending && (
          <button
            id="skip-exam-date-btn"
            onClick={handleNext}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground calm-transition focus-calm"
          >
            Skip for now →
          </button>
        )}
      </motion.div>
    </div>
  );
}
