import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, ArrowRight, BookOpen, Brain, Activity, Zap, Target, MessageSquare, Grid3x3 } from "lucide-react";

const LEVELS = [
  { id:"N5", label:"JLPT N5", desc:"Beginner — ~800 words", progress:38, locked:false },
  { id:"N4", label:"JLPT N4", desc:"Elementary — ~1,500 words", progress:0, locked:false },
  { id:"N3", label:"JLPT N3", desc:"Intermediate — ~3,700 words", progress:0, locked:true },
  { id:"N2", label:"JLPT N2", desc:"Advanced — ~6,000 words",    progress:0, locked:true },
  { id:"N1", label:"JLPT N1", desc:"Master — ~10,000 words",     progress:0, locked:true },
];

interface Props {
  onNavigate:    (page: string) => void;
  onLevelSelect: (lvl: string) => void;
  togglePulse:   () => void;
  toggleChat:    () => void;
  toggleCharts:  () => void;
  profile?:      any;
}

export function Roadmap({ onNavigate, onLevelSelect, togglePulse, toggleChat, toggleCharts, profile }: Props) {
  const [expanded, setExpanded] = useState<string | null>(profile?.current_level || "N5");
  const readiness = profile?.readiness_score ?? 35;
  const streak    = profile?.streak ?? 0;

  const toggle = (id: string, locked: boolean) => {
    if (locked) return;
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) onLevelSelect(next);
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* ── 1. CONTINUE LEARNING (TOP) ── */}
      <button
        onClick={() => onNavigate("practice")}
        style={{
          width:"100%", 
          height: 88, 
          borderRadius: 12,
          background: "#fff", 
          color: "#000",
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          padding: "0 40px",
          justifyContent: "space-between", 
          cursor: "pointer", 
          transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform="translateY(-2px)";
          e.currentTarget.style.background="#f5f5f5";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform="translateY(0)";
          e.currentTarget.style.background="#fff";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Zap size={20} fill="currentColor" />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Next Step: Master N5 Kanji</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Continue learning session</div>
          </div>
        </div>
        <ArrowRight size={32} />
      </button>

      {/* ── 2. STATS ROW (3 Equal Blocks) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <StatsCard icon={<Activity size={20}/>} label="Daily Streak" value={`${streak} Days`} color="#fff" />
        <StatsCard icon={<Target size={20}/>} label="Mastery Sync" value={`${readiness}%`} color="#22C55E" />
        <StatsCard icon={<BookOpen size={20}/>} label="Words Learnt" value="842" color="#fff" />
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
        {/* ── 3. ROADMAP (MAIN AREA - Dominant) ── */}
        <div style={{ flex: 1, background: "#121214", border: "1px solid #1F1F23", borderRadius: 16, padding: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>JLPT Learning Path</h2>
            <div style={{ display:"flex", gap:12 }}>
               <SmallAction icon={<Grid3x3 size={14}/>} label="Charts" onClick={toggleCharts} />
               <SmallAction icon={<MessageSquare size={14}/>} label="Assistant" onClick={toggleChat} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {LEVELS.map((lvl, i) => {
              const active = expanded === lvl.id;
              return (
                <div key={lvl.id} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 80, flexShrink: 0 }}>
                    <button
                      onClick={() => toggle(lvl.id, lvl.locked)}
                      style={{
                        width: 56, height: 56, borderRadius: "50%",
                        border: active ? "3px solid #fff" : "1px solid #1F1F23",
                        background: active ? "#fff" : "#0B0B0C",
                        color: active ? "#000" : (lvl.locked ? "#2a2a2d" : "#fff"),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: lvl.locked ? "default" : "pointer",
                        transition: "all 200ms ease",
                        fontSize: 18, fontWeight: 800,
                      }}
                    >
                      {lvl.locked ? <Lock size={18}/> : lvl.id}
                    </button>
                    {i < LEVELS.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "#1F1F23", margin: "8px 0" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingLeft: 32, paddingBottom: i < LEVELS.length - 1 ? 40 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: lvl.locked ? "#2a2a2d" : "#fff" }}>{lvl.label}</div>
                        <div style={{ fontSize: 14, color: "#A1A1AA", fontWeight: 500 }}>{lvl.desc}</div>
                      </div>
                      {!lvl.locked && lvl.progress > 0 && (
                        <div style={{ textAlign: "right" }}>
                           <div style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>{lvl.progress}%</div>
                        </div>
                      )}
                    </div>
                    {!lvl.locked && lvl.progress > 0 && (
                      <div style={{ width: "100%", height: 3, background: "#1F1F23", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${lvl.progress}%`, height: "100%", background: "#22C55E", borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. ACTION PANEL (RIGHT/SIDE) ── */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 24, background: "#121214", border: "1px solid #1F1F23", borderRadius: 16 }}>
             <h3 style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#A1A1AA", marginBottom: 24 }}>Session Control</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LargeActionButton 
                  icon={<BookOpen size={20}/>} 
                  label="Practice Mode" 
                  sub="New Kanji & Vocabulary" 
                  onClick={() => onNavigate("practice")} 
                  primary 
                />
                <LargeActionButton 
                  icon={<Brain size={20}/>} 
                  label="Review Session" 
                  sub="Active Recall Training" 
                  onClick={() => onNavigate("flashcards")} 
                />
             </div>
          </div>

          <div 
            onClick={togglePulse}
            style={{ 
              padding: 24, 
              background: "rgba(34, 197, 94, 0.05)", 
              border: "1px solid rgba(34, 197, 94, 0.1)", 
              borderRadius: 16,
              cursor: "pointer"
            }}
          >
             <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#22C55E", marginBottom: 8 }}>
                 <Zap size={16} fill="currentColor" />
                 <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>System Pulse</span>
             </div>
             <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
               Your learning efficiency is currenty <span style={{ color: "#fff", fontWeight: 700 }}>Optimal</span>.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: any) {
  return (
    <div style={{ background: "#121214", border: "1px solid #1F1F23", borderRadius: 12, padding: 32, display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </div>
  );
}

function LargeActionButton({ icon, label, sub, onClick, primary=false }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: 24, borderRadius: 12,
        background: primary ? "#fff" : "transparent",
        color: primary ? "#000" : "#fff",
        border: primary ? "none" : "1px solid #1F1F23",
        display: "flex", flexDirection: "column", gap: 8,
        cursor: "pointer", transition: "all 150ms ease",
        textAlign: "left"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.02)";
        if (!primary) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        if (!primary) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ color: primary ? "#000" : "#A1A1AA" }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 12, opacity: 0.6 }}>{sub}</div>
    </button>
  );
}

function SmallAction({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: "rgba(255,255,255,0.03)", border: "1px solid #1F1F23",
        borderRadius: 8, color: "#A1A1AA", fontSize: 12, fontWeight: 700,
        cursor: "pointer", transition: "all 150ms ease"
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="#fff"; e.currentTarget.style.color="#fff"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="#1F1F23"; e.currentTarget.style.color="#A1A1AA"; }}
    >
      {icon} {label}
    </button>
  );
}
