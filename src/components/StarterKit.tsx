import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Languages, PenTool, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { KanaChart } from './KanaChart';
import { PronunciationPractice } from './PronunciationPractice';

interface StarterKitProps {}

type ResourceId =
  | 'hiragana'
  | 'katakana'
  | 'basic-kanji'
  | 'basic-grammar'
  | 'basic-vocabulary'
  | 'pronunciation';

const modules: Array<{
  id: ResourceId;
  title: string;
  desc: string;
  icon: typeof Languages;
}> = [
  { id: 'hiragana', title: 'Hiragana Chart', desc: 'Master basic kana reading and writing.', icon: Languages },
  { id: 'katakana', title: 'Katakana Chart', desc: 'Learn foreign-word writing patterns.', icon: Languages },
  { id: 'basic-kanji', title: 'Basic Kanji', desc: 'High-frequency beginner kanji with meanings and readings.', icon: PenTool },
  { id: 'basic-grammar', title: 'Basic Grammar', desc: 'Particles, sentence order, and beginner structures.', icon: BookOpen },
  { id: 'basic-vocabulary', title: 'Basic Vocabulary', desc: 'Greetings, numbers, time, family, and shopping.', icon: BookOpen },
  { id: 'pronunciation', title: 'Pronunciation Guide', desc: 'Recording practice with sound and accent feedback.', icon: Volume2 },
];

const RESOURCE_CONTENT: Record<ResourceId, { title: string; points: string[] }> = {
  hiragana: {
    title: 'Hiragana Foundations',
    points: [
      'Start with the vowel row, then practice k/s/t/n progression.',
      'Focus on consistent mora timing instead of rushing.',
      'Use chart quiz mode after every 10-15 kana.',
    ],
  },
  katakana: {
    title: 'Katakana Foundations',
    points: [
      'Prioritize loanword patterns and visually similar pairs.',
      'Use chart mode to reinforce shape differences from hiragana.',
      'Practice common travel and menu words first.',
    ],
  },
  'basic-kanji': {
    title: 'Basic Kanji',
    points: [
      'Start with 日, 月, 火, 水, 木, 金, 土 and daily-life nouns.',
      'Pair each kanji with one reading and one example word first.',
      'Review using SRS after each lesson block.',
    ],
  },
  'basic-grammar': {
    title: 'Basic Grammar',
    points: [
      'Learn particles は, が, を, に before longer patterns.',
      'Build confidence with です/ます before plain forms.',
      'Practice one grammar point in 3-5 short sentences.',
    ],
  },
  'basic-vocabulary': {
    title: 'Basic Vocabulary',
    points: [
      'Cover greetings, numbers, time, family, shopping, and food first.',
      'Mix recognition and recall, not just multiple-choice review.',
      'Attach every new word to a phrase or image.',
    ],
  },
  pronunciation: {
    title: 'Pronunciation Guide',
    points: [
      'Record short phrases and compare transcript clarity.',
      'Pay attention to long vowels, small tsu pauses, and rhythm.',
      'Pitch-accent scoring should be treated as guidance, not ground truth.',
    ],
  },
};

export function StarterKit({}: StarterKitProps) {
  const [selectedResource, setSelectedResource] = useState<ResourceId | null>(null);

  const renderResourceBody = (resourceId: ResourceId) => {
    const resourceContent = RESOURCE_CONTENT[resourceId];
    return (
      <motion.div
        key={`${resourceId}-content`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="mt-3 glass-card-subtle p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">{resourceContent.title}</p>
            <span className="text-xs text-muted-foreground capitalize">{resourceId.replace('-', ' ')}</span>
          </div>
          <div className="space-y-2">
            {resourceContent.points.map((point) => (
              <p key={point} className="text-sm text-muted-foreground">{point}</p>
            ))}
          </div>

          {resourceId === 'hiragana' && <KanaChart script="hiragana" />}
          {resourceId === 'katakana' && <KanaChart script="katakana" />}
          {resourceId === 'pronunciation' && <PronunciationPractice />}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-2">Starter Kit</h1>
          <p className="text-muted-foreground">A zero-to-beginner foundation before JLPT study.</p>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Starter Resources</p>
            <div className="space-y-2">
              {modules.map((m) => {
                const Icon = m.icon;
                const active = selectedResource === m.id;
                return (
                  <div key={m.id} className="rounded-xl">
                    <button
                      onClick={() => setSelectedResource((prev) => (prev === m.id ? null : m.id))}
                      className={`w-full p-3 rounded-xl text-left calm-transition focus-calm ${
                        active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{m.title}</p>
                          <p className={`text-xs mt-1 ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{m.desc}</p>
                        </div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {active ? renderResourceBody(m.id) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
