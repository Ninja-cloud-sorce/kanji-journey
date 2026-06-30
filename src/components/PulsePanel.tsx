import { motion, AnimatePresence } from "framer-motion";
import { X, Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { useEffect } from "react";

interface PulsePanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

export function PulsePanel({ isOpen, onClose, profile }: PulsePanelProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { e.key === "Escape" && onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", right: 0, top: 0, bottom: 0,
              width: 400, background: "#121214", borderLeft: "1px solid #1F1F23",
              zIndex: 1001, display: "flex", flexDirection: "column", padding: 32, gap: 40, overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>System Pulse</span>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#A1A1AA", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ color: "#A1A1AA", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mastery Sync</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{profile?.readiness_score || 35}%</span>
                <span style={{ fontSize: 14, color: "#22C55E", fontWeight: 600, paddingBottom: 6 }}>+2.4% today</span>
              </div>
              <div style={{ display: "flex", gap: 4, height: 16 }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: 2, background: i < 11 ? `rgba(34, 197, 94, ${0.1 + (i * 0.06)})` : "rgba(255,255,255,0.03)" }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Item icon={<Calendar size={18} />} title="Next cycle" subtitle="24 cards due in 2h" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Target size={14} className="text-[#A1A1AA]" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.05em" }}>Critical Attention</span>
                 </div>
                 <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {['食べる', '行く', '見る', '来る'].map(word => (
                      <div key={word} style={{ padding: "12px", background: "#1F1F23", border: "1px solid #1F1F23", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center" }}>{word}</div>
                    ))}
                 </div>
              </div>
              <div style={{ padding: "20px", background: "rgba(34, 197, 94, 0.03)", border: "1px solid rgba(34, 197, 94, 0.1)", borderRadius: 12 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#22C55E", marginBottom: 8 }}><TrendingUp size={16} /><span style={{ fontSize: 12, fontWeight: 700 }}>Efficiency</span></div>
                 <p style={{ fontSize: 13, color: "#A1A1AA", lineHeight: 1.5, margin: 0 }}>Optimal recall resonance detected in morning sessions.</p>
              </div>
            </div>

            <button onClick={onClose} style={{ marginTop: "auto", width: "100%", height: 48, background: "#fff", color: "#000", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Acknowledge</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Item({ icon, title, subtitle }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid #1F1F23", display: "flex", alignItems: "center", justifyContent: "center", color: "#A1A1AA" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#A1A1AA" }}>{subtitle}</div>
      </div>
      <ArrowRight size={14} style={{ opacity: 0.2, color: "#A1A1AA" }} />
    </div>
  );
}
