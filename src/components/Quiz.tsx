import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X, Volume2 } from 'lucide-react';

interface QuizProps {
  onNavigate: (page: string) => void;
}

const sampleQuestions = [
  {
    id: 1,
    type: 'reading',
    question: 'What is the reading of この漢字?',
    character: '水',
    options: ['みず', 'ひ', 'き', 'やま'],
    correct: 0,
  },
  {
    id: 2,
    type: 'meaning',
    question: 'What does this mean?',
    character: 'おはようございます',
    options: ['Good night', 'Good morning', 'Thank you', 'Goodbye'],
    correct: 1,
  },
  {
    id: 3,
    type: 'grammar',
    question: 'Fill in the blank: 私___学生です。',
    character: '私___学生です。',
    options: ['は', 'を', 'に', 'で'],
    correct: 0,
  },
];

export function Quiz({ onNavigate }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const question = sampleQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;
  const isLastQuestion = currentQuestion === sampleQuestions.length - 1;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Would navigate to results
      onNavigate('dashboard');
      return;
    }
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto w-full flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary calm-transition focus-calm"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            {sampleQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-1 rounded-full calm-transition ${
                  index < currentQuestion
                    ? 'bg-success'
                    : index === currentQuestion
                      ? 'bg-primary'
                      : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{sampleQuestions.length}
          </span>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Question */}
            <div className="glass-card p-8 mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">{question.question}</p>
              <p className="font-jp text-5xl font-light text-foreground mb-4">
                {question.character}
              </p>
              {question.type === 'reading' && (
                <button className="p-2 rounded-full hover:bg-secondary calm-transition">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === question.correct;
                
                let optionStyle = 'glass-card-subtle hover:scale-[1.02]';
                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-success/20 border-2 border-success';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-destructive/20 border-2 border-destructive';
                  } else {
                    optionStyle = 'opacity-50';
                  }
                }

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl text-left calm-transition focus-calm ${optionStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`${question.type === 'reading' ? 'font-jp text-lg' : ''} text-foreground`}>
                        {option}
                      </span>
                      {showResult && isCorrectOption && (
                        <Check className="w-5 h-5 text-success" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <X className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback & Next */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 space-y-4"
                >
                  <div className={`p-4 rounded-xl text-center ${
                    isCorrect ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    <p className={`font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                      {isCorrect ? 'Correct! 正解！' : 'Not quite. 残念！'}
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 calm-transition hover:opacity-90 focus-calm"
                  >
                    <span>{isLastQuestion ? 'Finish' : 'Next Question'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
