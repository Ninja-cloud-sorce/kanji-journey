import { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { KANA_EXAMPLES } from '@/data/kanaExamples';

type ScriptType = 'hiragana' | 'katakana';

interface KanaCell {
  kana: string;
  romaji: string;
}

interface KanaChartProps {
  script: ScriptType;
}

const HIRAGANA_ROWS: KanaCell[][] = [
  [{ kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' }],
  [{ kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' }],
  [{ kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' }],
  [{ kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' }, { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' }],
  [{ kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' }],
  [{ kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' }],
  [{ kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' }, { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' }],
  [{ kana: 'や', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ゆ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'よ', romaji: 'yo' }],
  [{ kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' }],
  [{ kana: 'わ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'を', romaji: 'wo' }],
  [{ kana: 'ん', romaji: 'n' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }],
];

const KATAKANA_ROWS: KanaCell[][] = [
  [{ kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' }, { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' }],
  [{ kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' }],
  [{ kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' }],
  [{ kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' }, { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' }],
  [{ kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' }],
  [{ kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' }],
  [{ kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' }, { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' }],
  [{ kana: 'ヤ', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ユ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'ヨ', romaji: 'yo' }],
  [{ kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' }],
  [{ kana: 'ワ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'ヲ', romaji: 'wo' }],
  [{ kana: 'ン', romaji: 'n' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }],
];

function speak(text: string) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function KanaChart({ script }: KanaChartProps) {
  const rows = useMemo(() => (script === 'hiragana' ? HIRAGANA_ROWS : KATAKANA_ROWS), [script]);
  const [quizMode, setQuizMode] = useState(false);
  const [target, setTarget] = useState<KanaCell | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<KanaCell | null>(null);
  const [clickedKana, setClickedKana] = useState<string | null>(null);

  const allCells = useMemo(
    () => rows.flat().filter((c) => c.kana),
    [rows]
  );

  const nextQuiz = () => {
    const pick = allCells[Math.floor(Math.random() * allCells.length)];
    setTarget(pick);
    setFeedback('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground capitalize">{script} Chart</p>
        <button
          onClick={() => {
            const enabled = !quizMode;
            setQuizMode(enabled);
            if (enabled) nextQuiz();
          }}
          className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground"
        >
          {quizMode ? 'Exit Quiz' : 'Quiz Mode'}
        </button>
      </div>

      {quizMode && target && (
        <div className="glass-card-subtle p-3 rounded-xl">
          <p className="text-xs text-muted-foreground">Tap the kana for:</p>
          <p className="text-lg font-medium text-foreground">{target.romaji}</p>
          {feedback && <p className="text-xs mt-1 text-muted-foreground">{feedback}</p>}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {rows.flat().map((cell, idx) => {
          if (!cell.kana) return <div key={`empty-${idx}`} className="h-16 rounded-lg bg-secondary/20" />;
          const isClicked = clickedKana === cell.kana;
          return (
            <button
              key={`${cell.kana}-${idx}`}
              onClick={() => {
                speak(cell.kana);
                setSelectedCell(cell);
                setClickedKana(cell.kana);
                window.setTimeout(() => setClickedKana(null), 180);
                if (!quizMode || !target) return;
                setFeedback(cell.kana === target.kana ? 'Correct! Nice recall.' : `Not quite. Correct was ${target.kana}.`);
                if (cell.kana === target.kana) window.setTimeout(nextQuiz, 650);
              }}
              className={`h-16 rounded-lg glass-card-subtle flex flex-col items-center justify-center calm-transition ${
                isClicked ? 'scale-[0.96] ring-1 ring-primary/30' : 'hover:scale-[1.02]'
              }`}
            >
              <span className="text-lg text-foreground">{cell.kana}</span>
              <span className="text-[10px] text-muted-foreground">{cell.romaji}</span>
            </button>
          );
        })}
      </div>

      {selectedCell && (
        <div className="glass-card-subtle p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {selectedCell.kana} · {selectedCell.romaji}
            </p>
            <p className="text-xs text-muted-foreground">Tap to hear</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Example: {KANA_EXAMPLES[selectedCell.kana]?.word ?? '—'}
            {KANA_EXAMPLES[selectedCell.kana]?.translation
              ? ` (${KANA_EXAMPLES[selectedCell.kana].translation})`
              : ''}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="w-3.5 h-3.5" />
        Tap any cell to hear pronunciation.
      </div>
    </div>
  );
}
