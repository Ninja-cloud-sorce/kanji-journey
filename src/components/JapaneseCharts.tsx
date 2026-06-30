import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Item { id:string; char:string; reading:string; meaning:string; }

const HIRA: Item[] = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split("").map((c,i) => ({
  id:`h${i}`, char:c,
  reading:["a","i","u","e","o","ka","ki","ku","ke","ko","sa","shi","su","se","so","ta","chi","tsu","te","to","na","ni","nu","ne","no","ha","hi","fu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wo","n"][i],
  meaning:"Japanese syllable"
}));

const KATA: Item[] = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("").map((c,i) => ({
  id:`k${i}`, char:c,
  reading:["a","i","u","e","o","ka","ki","ku","ke","ko","sa","shi","su","se","so","ta","chi","tsu","te","to","na","ni","nu","ne","no","ha","hi","fu","he","ho","ma","mi","mu","me","mo","ya","yu","yo","ra","ri","ru","re","ro","wa","wo","n"][i],
  meaning:"Katakana syllable"
}));

const KANJI: Item[] = [
  {id:"k1",char:"日",reading:"nichi / ひ",meaning:"Day, Sun"},
  {id:"k2",char:"月",reading:"getsu / つき",meaning:"Month, Moon"},
  {id:"k3",char:"火",reading:"ka / ひ",meaning:"Fire"},
  {id:"k4",char:"水",reading:"sui / みず",meaning:"Water"},
  {id:"k5",char:"木",reading:"moku / き",meaning:"Tree"},
  {id:"k6",char:"金",reading:"kin / かね",meaning:"Gold, Money"},
  {id:"k7",char:"土",reading:"do / つち",meaning:"Earth, Soil"},
  {id:"k8",char:"山",reading:"san / やま",meaning:"Mountain"},
  {id:"k9",char:"川",reading:"sen / かわ",meaning:"River"},
  {id:"k10",char:"人",reading:"jin / ひと",meaning:"Person"},
  {id:"k11",char:"口",reading:"kō / くち",meaning:"Mouth"},
  {id:"k12",char:"手",reading:"shu / て",meaning:"Hand"},
  {id:"k13",char:"目",reading:"moku / め",meaning:"Eye"},
  {id:"k14",char:"耳",reading:"ji / みみ",meaning:"Ear"},
  {id:"k15",char:"足",reading:"soku / あし",meaning:"Foot, Leg"},
  {id:"k16",char:"力",reading:"ryoku / ちから",meaning:"Power"},
  {id:"k17",char:"本",reading:"hon",meaning:"Book, Origin"},
  {id:"k18",char:"学",reading:"gaku / まなぶ",meaning:"Study, Learn"},
  {id:"k19",char:"生",reading:"sei / なま",meaning:"Life, Raw"},
  {id:"k20",char:"先",reading:"sen / さき",meaning:"Before, Ahead"},
];

const TABS = [
  { id:"hira", label:"Hiragana", data:HIRA },
  { id:"kata", label:"Katakana", data:KATA },
  { id:"kanji",label:"Kanji N5", data:KANJI },
];

interface Props { onNavigate:(p:string)=>void; }

export function JapaneseCharts({ onNavigate }: Props) {
  const [tab,      setTab]      = useState("hira");
  const [selected, setSelected] = useState<Item|null>(null);

  const current = TABS.find(t => t.id === tab)!;

  return (
    <div style={{ maxWidth:800, margin:"0 auto", paddingBottom:64 }}>
      {/* Header */}
      <div style={{ marginBottom:48 }}>
        <h1 style={{ fontSize:40, fontWeight:700, letterSpacing:"-0.03em", margin:0 }}>Reference Charts</h1>
        <p style={{ color:"#A1A1AA", fontSize:16, margin:"12px 0 0" }}>Master the fundamental scripts of the Japanese language.</p>
      </div>

      {/* Tabs / Switcher */}
      <div style={{ 
        display:"inline-flex", 
        gap:4, 
        marginBottom:48, 
        background:"#121214", 
        border:"1px solid #1F1F23", 
        borderRadius:10, 
        padding:4 
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelected(null); }}
            style={{
              height:36, borderRadius:8, padding:"0 20px",
              background: tab===t.id ? "#fff" : "transparent",
              color:      tab===t.id ? "#000" : "#A1A1AA",
              border:"none", fontSize:13, fontWeight:700, cursor:"pointer",
              transition:"all 150ms ease"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid — 10 columns */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(10, 1fr)",
        gap:12,
      }}>
        {current.data.map(item => {
          const sel = selected?.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(sel ? null : item)}
              style={{
                aspectRatio:"1/1", borderRadius:12,
                background: sel ? "#fff"        : "#121214",
                border:     sel ? "1px solid #fff" : "1px solid #1F1F23",
                color:      sel ? "#000"        : "#fff",
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"all 150ms ease",
                padding:0
              }}
              onMouseEnter={e => { if (!sel) { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.borderColor="#A1A1AA"; } }}
              onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.borderColor=sel?"#fff":"#1F1F23"; }}
            >
              <span className="font-jp" style={{ fontSize:32, fontWeight:700, lineHeight:1 }}>{item.char}</span>
              <span style={{ fontSize:10, color: sel ? "rgba(0,0,0,0.5)" : "#A1A1AA", fontWeight:800, textTransform:"uppercase", marginTop:4 }}>{item.reading}</span>
            </button>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{   opacity:0 }}
            style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(11,11,12,0.9)", backdropFilter:"blur(4px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale:0.9, opacity:0, y:20 }}
              animate={{ scale:1,   opacity:1, y:0 }}
              exit={{   scale:0.9, opacity:0, y:20 }}
              transition={{ type:"spring", damping:25, stiffness:300 }}
              style={{ width:400, background:"#121214", border:"1px solid #1F1F23", borderRadius:20, padding:48, textAlign:"center" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize:120, fontWeight:800, color:"#fff", marginBottom:24 }}>{selected.char}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, textAlign:"left", marginBottom:48 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#A1A1AA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Reading</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>{selected.reading}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#A1A1AA", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Meaning</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>{selected.meaning}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                style={{ width:"100%", height:56, borderRadius:12, background:"#fff", color:"#000", border:"none", fontSize:16, fontWeight:700, cursor:"pointer" }}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
