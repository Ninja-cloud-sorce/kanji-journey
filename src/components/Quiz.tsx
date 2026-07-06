import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import n5Data from "@/data/jlpt_n5.json";

interface Props {
  onNavigate:  (page: string) => void;
  onBack:      () => void;
  togglePulse: () => void;
  level?:      string;
}

export function Quiz({ onNavigate, onBack, togglePulse, level = "N5" }: Props) {
  const questions = useMemo(() => (n5Data as any).jlpt_n5_important_questions.quizzes.slice(0, 10), []);

  const [idx,        setIdx]        = useState(0);
  const [chosen,     setChosen]     = useState<number | null>(null);
  const [revealed,   setRevealed]   = useState(false);
  const [score,      setScore]      = useState(0);
  const [finished,   setFinished]   = useState(false);
  const [isWrong,    setIsWrong]    = useState(false);

  // Auto-pulse on completion (300ms delay)
  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => togglePulse(), 300);
      return () => clearTimeout(t);
    }
  }, [finished, togglePulse]);

  // Clear isWrong flag after 500ms with proper cleanup
  useEffect(() => {
    if (!isWrong) return;
    const t = setTimeout(() => setIsWrong(false), 500);
    return () => clearTimeout(t);
  }, [isWrong]);

  const q      = questions[idx];
  const isLast = idx === questions.length - 1;
  const pct    = Math.round( ((idx + (revealed ? 1 : 0)) / questions.length) * 100 );

  const pick = (i: number) => {
    if (revealed) return;
    setChosen(i);
    setRevealed(true);
    const correct = q.options[i] === q.correct_answer;
    if (correct) {
      setScore(s => s + 1);
    } else {
      setIsWrong(true);
    }
  };

  const next = () => {
    if (isLast) { setFinished(true); return; }
    setIdx(i => i + 1);
    setChosen(null);
    setRevealed(false);
    setIsWrong(false);
  };

  if (finished) return (
    <div style={{ maxWidth:560, margin:"0 auto", paddingTop:64, display:"flex", flexDirection:"column", gap:40, alignItems:"center", textAlign:"center" }}>
      <div>
        <p style={{ color:"#A1A1AA", fontSize:13, margin:"0 0 12px" }}>Session complete</p>
        <h1 style={{ fontSize:56, fontWeight:700, letterSpacing:"-0.04em", lineHeight:1, margin:0 }}>
          {score}/{questions.length}
        </h1>
        <p style={{ color:"#A1A1AA", fontSize:15, margin:"16px 0 0" }}>
          {score >= 8 ? "Excellent! Ready to review." : "Keep practicing to improve."}
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%" }}>
        <button
          onClick={() => onNavigate("flashcards")}
          style={{ height:56, borderRadius:8, background:"#fff", color:"#000", fontSize:15, fontWeight:700, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 150ms ease", width:"100%" }}
        >
          Start Review <ArrowRight size={18}/>
        </button>
        <button onClick={onBack} className="btn-ghost" style={{ width:"100%" }}>Back to learn hub</button>
      </div>
    </div>
  );

  return (
    <div style={{ width:"80%", margin:"0 auto", paddingTop:32, paddingBottom:64 }}>
      {/* Progress bar */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:64 }}>
        <div style={{ flex:1, height:6, background:"#1F1F23", borderRadius:3 }}>
          <motion.div
            animate={{ width:`${pct}%` }}
            transition={{ duration:0.3 }}
            style={{ height:"100%", background:"#22C55E", borderRadius:3 }}
          />
        </div>
        <span style={{ color:"#A1A1AA", fontSize:14, fontWeight:700 }}>{idx + 1} / {questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity:0, x:20 }}
          animate={{ opacity:1, x:0 }}
          exit={{   opacity:0, x:-20 }}
          transition={{ duration:0.25, ease:"easeInOut" }}
        >
          <motion.h2
            animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="font-jp"
            style={{ fontSize:48, fontWeight:800, lineHeight:1.3, marginBottom:64, color:"#fff", letterSpacing:"-0.02em" }}
          >
            {q.question}
          </motion.h2>

          <div style={{ display:"flex", flexDirection:"column", gap:16, width:"100%" }}>
            {q.options.map((opt: string, i: number) => {
              const isCorrect  = opt === q.correct_answer;
              const isSelected = chosen === i;
              
              let borderColor = "#1F1F23";
              let bg = "#121214";
              let color = "#fff";
              let glow = "none";

              if (revealed) {
                if (isCorrect) {
                  borderColor = "#22C55E";
                  bg = "rgba(34, 197, 94, 0.1)";
                  color = "#22C55E";
                  glow = "0 0 20px rgba(34, 197, 94, 0.2)";
                } else if (isSelected) {
                  borderColor = "#EF4444";
                  bg = "rgba(239, 68, 68, 0.1)";
                  color = "#EF4444";
                } else {
                  bg = "#0B0B0C";
                  color = "#3a3a40";
                }
              }

              return (
                <button
                  key={i}
                  disabled={revealed}
                  onClick={() => pick(i)}
                  style={{
                    width:"100%", padding:"24px 32px", borderRadius:12,
                    border:`1px solid ${borderColor}`, background:bg, color,
                    display:"flex", alignItems:"center", gap:20,
                    fontSize:18, fontWeight:700, cursor:revealed ? "default" : "pointer",
                    transition:"all 150ms ease", boxShadow:glow,
                    textAlign:"left"
                  }}
                  onMouseEnter={e => !revealed && (e.currentTarget.style.borderColor = "#A1A1AA")}
                  onMouseLeave={e => !revealed && (e.currentTarget.style.borderColor = "#1F1F23")}
                >
                  <span style={{ width:32, height:32, borderRadius:8, border:"1px solid currentColor", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, opacity:0.6 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex:1 }}>{opt}</span>
                  {revealed && isCorrect  && <Check size={24} />}
                  {revealed && isSelected && !isCorrect && <X size={24} />}
                </button>
              );
            })}
          </div>

          <div style={{ height:120, display:"flex", alignItems:"flex-end" }}>
            <AnimatePresence>
              {revealed && (
                <motion.button
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  onClick={next}
                  style={{
                    width:"100%", height:64, borderRadius:12,
                    background:"#fff", color:"#000", border:"none",
                    fontSize:17, fontWeight:800, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:12,
                    transition:"all 150ms ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e5e5e5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  {isLast ? "Complete Session" : "Next Question"} <ArrowRight size={20}/>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
