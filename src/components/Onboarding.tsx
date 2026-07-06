import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, BookOpen, Clock, Target, Calendar, User } from 'lucide-react';
import { Logo } from './Logo';
import { useCompleteOnboarding } from '@/hooks/data/useLearningPath';
import { useToast } from '@/hooks/use-toast';
import { AVATAR_PRESETS, AvatarDisplay } from './Settings';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const MOTIVATION_OPTIONS = [
  { id: 'exam',    label: 'Pass JLPT exam',       emoji: '📜' },
  { id: 'travel',  label: 'Travel to Japan',       emoji: '✈️' },
  { id: 'anime',   label: 'Enjoy anime/manga',     emoji: '🎌' },
  { id: 'work',    label: 'Career / business',     emoji: '💼' },
  { id: 'culture', label: 'Love the culture',      emoji: '⛩️' },
  { id: 'other',   label: 'Other',                 emoji: '🌸' },
];
const HOURS_OPTIONS  = [1, 3, 5, 7, 10];
const GOAL_OPTIONS   = [10, 15, 20, 30, 45, 60];
const EXPERIENCE_OPTIONS = [
  { id: 'none',         label: 'Complete beginner',  desc: 'Never studied Japanese' },
  { id: 'hiragana',     label: 'Know kana',           desc: 'Can read hiragana / katakana' },
  { id: 'basic',        label: 'Basic vocabulary',    desc: 'Know some N5 words' },
  { id: 'intermediate', label: 'Intermediate',        desc: 'Studied for 1+ year' },
];

type Step = 'identity' | 'level' | 'motivation' | 'experience' | 'schedule' | 'examDate';
const STEPS: Step[] = ['identity', 'level', 'motivation', 'experience', 'schedule', 'examDate'];

export function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [stepIndex, setStepIndex]         = useState(0);
  const [displayName, setDisplayName]     = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('preset:学');
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [motivation, setMotivation]       = useState<string>('');
  const [experience, setExperience]       = useState('');
  const [hoursPerWeek, setHoursPerWeek]   = useState(5);
  const [dailyGoal, setDailyGoal]         = useState(15);
  const [examDate, setExamDate]           = useState('');

  const { toast } = useToast();
  const completeOnboarding = useCompleteOnboarding();

  // Only show the exam-date step when the user explicitly chose the JLPT exam goal
  const activeSteps: Step[] = motivation === 'exam'
    ? STEPS
    : STEPS.filter(s => s !== 'examDate');

  const currentStep = activeSteps[stepIndex];
  const isLastStep = stepIndex === activeSteps.length - 1;

  const canAdvance = () => {
    if (currentStep === 'identity')    return displayName.trim().length >= 2;
    if (currentStep === 'level')       return !!selectedLevel;
    if (currentStep === 'motivation')  return !!motivation;
    if (currentStep === 'experience')  return !!experience;
    if (currentStep === 'schedule')    return !!hoursPerWeek && !!dailyGoal;
    if (currentStep === 'examDate')    return true;
    return true;
  };

  const handleNext = async () => {
    if (!isLastStep) {
      setStepIndex(i => i + 1);
      return;
    }
    try {
      await completeOnboarding.mutateAsync({
        userId,
        displayName: displayName.trim(),
        avatarUrl: selectedAvatar,
        selectedLevel,
        motivation,
        hoursPerWeek,
        priorExperience: experience,
        examDate: examDate || undefined,
        dailyGoalMinutes: dailyGoal,
      });
      localStorage.setItem('kairo_onboarding_done', '1');
      onComplete();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? '';
      // Database not yet connected — preferences can't persist, but still let the user in.
      const isDbError = msg.includes('bufferCommands') || msg.includes('initial connection') || msg.includes('MONGODB_URI');
      if (isDbError) {
        localStorage.setItem('kairo_onboarding_done', '1');
        toast({ title: 'Almost there!', description: 'Add MONGODB_URI to .env to persist your settings.', variant: 'default' });
        onComplete();
      } else {
        toast({ title: 'Error saving preferences', description: msg, variant: 'destructive' });
      }
    }
  };

  const handleBack = () => setStepIndex(i => Math.max(0, i - 1));


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo + progress */}
        <div className="text-center space-y-4">
          <Logo size="large" />
          <div className="flex gap-1.5 justify-center">
            {activeSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full calm-transition ${
                  idx <= stepIndex ? 'bg-primary w-8' : 'bg-secondary w-4'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Step {stepIndex + 1} of {activeSteps.length}</p>
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

            {/* IDENTITY */}
            {currentStep === 'identity' && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-medium text-foreground">Create your identity</h2>
                </div>
                <p className="text-sm text-muted-foreground">Choose a name and avatar to represent yourself.</p>

                {/* Avatar preview */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-white/20 overflow-hidden flex-shrink-0 shadow-lg">
                    <AvatarDisplay avatarUrl={selectedAvatar} size="md" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={30}
                    className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
                  />
                </div>

                {/* Avatar grid */}
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatar(preset.id)}
                      title={preset.label}
                      className={`aspect-square rounded-xl border-2 transition-all duration-150 flex items-center justify-center bg-gradient-to-br ${preset.bg} active:scale-90 active:brightness-75 ${
                        selectedAvatar === preset.id
                          ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
                          : 'border-white/20 hover:border-white/50 hover:scale-105'
                      }`}
                    >
                      <span className="text-base font-bold text-white select-none">{preset.kanji}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

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
                  {JLPT_LEVELS.map(lvl => (
                    <button
                      key={lvl}
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
                  {MOTIVATION_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
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
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
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
                    {HOURS_OPTIONS.map(h => (
                      <button
                        key={h}
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
                    {GOAL_OPTIONS.map(g => (
                      <button
                        key={g}
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
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">Optional — you can set this later in Settings.</p>
              </>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {/* isPending only blocks the final submit step — back/continue on earlier steps always work */}
        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              className="p-3 rounded-xl bg-secondary text-foreground calm-transition hover:bg-secondary/80 focus-calm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || (isLastStep && completeOnboarding.isPending)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 calm-transition hover:opacity-90 focus-calm disabled:opacity-50"
          >
            {isLastStep && completeOnboarding.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLastStep ? 'Start Learning' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {currentStep === 'examDate' && (
          <button
            onClick={handleNext}
            disabled={completeOnboarding.isPending}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground calm-transition focus-calm disabled:opacity-40"
          >
            {completeOnboarding.isPending ? 'Saving…' : 'Skip for now →'}
          </button>
        )}
      </motion.div>
    </div>
  );
}
