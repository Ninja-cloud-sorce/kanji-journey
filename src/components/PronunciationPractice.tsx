import { useRef, useState } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface PronunciationResult {
  transcript: string;
  pronunciationScore: number;
  pitchAccentScore: number;
  suggestions: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function PronunciationPractice() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetText, setTargetText] = useState('おはようございます');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      recorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setLoading(true);
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          bytes.forEach((b) => { binary += String.fromCharCode(b); });
          const audioBase64 = btoa(binary);
          const res = await fetch(`${API_BASE_URL}/api/pronunciation/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetText,
              audioBase64,
              mimeType: audioBlob.type || 'audio/webm',
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
          setResult(data);
        } catch (err: any) {
          setError(err.message || 'Failed to score pronunciation');
        } finally {
          setLoading(false);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err: any) {
      setError(err.message || 'Microphone access failed');
    }
  };

  const stop = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== 'recording') return;
    rec.stop();
    rec.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <p className="font-medium text-foreground">Pronunciation Practice</p>
        <p className="text-sm text-muted-foreground">Record and get ASR + pitch-accent feedback.</p>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Target phrase</label>
        <input
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary text-foreground"
        />
      </div>

      <div className="flex gap-2">
        {!recording ? (
          <button onClick={start} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2">
            <Mic className="w-4 h-4" />
            Record
          </button>
        ) : (
          <button onClick={stop} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium flex items-center justify-center gap-2">
            <Square className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Scoring pronunciation...
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {result && (
        <div className="glass-card-subtle p-4 rounded-xl space-y-2">
          <p className="text-sm text-muted-foreground">Transcript: <span className="text-foreground">{result.transcript}</span></p>
          <p className="text-sm text-muted-foreground">Pronunciation score: <span className="text-foreground">{result.pronunciationScore}%</span></p>
          <p className="text-sm text-muted-foreground">Pitch accent score: <span className="text-foreground">{result.pitchAccentScore}%</span></p>
          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Suggestions</p>
              <ul className="text-sm text-foreground list-disc list-inside">
                {result.suggestions.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
