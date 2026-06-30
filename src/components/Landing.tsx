import { useEffect, useRef, useState } from "react";
import { Application } from "@splinetool/runtime";
import { motion, AnimatePresence } from "framer-motion";

interface LandingProps {
  onEnter: () => void;
  profile?: any;
}

export function Landing({ onEnter }: LandingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const appRef = useRef<any>(null);

  const [loaded, setLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  //--------------------------------------------------
  // LOAD SPLINE (NO BLACK SCREEN)
  //--------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;

    const spline = new Application(canvasRef.current);

    spline.load("https://prod.spline.design/VCZYU6XtnS3OCxOo/scene.splinecode")
      .then(() => {
        appRef.current = spline;

        const screenText = spline.findObjectByName("ScreenText");
        const clickToType = spline.findObjectByName("Click to type");
        const arrow = spline.findObjectByName("Arrow Cursor");

        // Set initial state
        if (clickToType) clickToType.visible = true;
        if (arrow) arrow.visible = true;
        if (screenText) (screenText as any).text = "";

        setLoaded(true);
      })
      .catch(err => {
        console.error("Spline failed to load:", err);
        // Fallback or handle error
      });

    return () => spline.dispose();
  }, []);

  //--------------------------------------------------
  // INPUT LOGIC (CLICK -> TYPE -> START -> ENTER)
  //--------------------------------------------------
  useEffect(() => {
    if (!isActive) return;

    let typedBuffer = "";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading || !appRef.current) return;

      const spline = appRef.current;
      const screenText = spline.findObjectByName("ScreenText");

      // Capture single character keys
      if (e.key.length === 1) {
        typedBuffer += e.key.toLowerCase();
        if (screenText) (screenText as any).text = typedBuffer;
      }

      // Handle Backspace
      if (e.key === "Backspace") {
        typedBuffer = typedBuffer.slice(0, -1);
        if (screenText) (screenText as any).text = typedBuffer;
      }

      // Handle Trigger on Enter
      if (e.key === "Enter") {
        if (typedBuffer.trim() === "start") {
          setIsLoading(true);

          if (screenText) (screenText as any).text = "LOADING SACTUARY...";

          const screen = spline.findObjectByName("Screen");
          if (screen) screen.emitEvent("mouseDown");

          // 🚀 Fast transition
          setExiting(true);
          setTimeout(() => {
            onEnter();
          }, 400);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isLoading, onEnter]);

  //--------------------------------------------------
  // LAMP INTERACTION
  //--------------------------------------------------
  useEffect(() => {
    if (!appRef.current || !loaded) return;

    const spline = appRef.current;
    let hasTriggered = false;

    const handleEvent = (e: any) => {
      const objName = e.target?.name;
      console.log("Clicked:", objName); // DEBUG

      // 🔥 IMPORTANT: match exact name from console
      if (objName === "Lamp" && !hasTriggered) {
        hasTriggered = true;

        const screenText = spline.findObjectByName("ScreenText");

        // STEP 1: Unified feedback
        if (screenText) {
          (screenText as any).text = "Loading...";
        }

        // STEP 2: Swift transition
        setTimeout(() => {
          setExiting(true);
          onEnter();
        }, 500);
      }
    };

    spline.addEventListener("mouseDown", handleEvent);

    return () => {
      spline.removeEventListener("mouseDown", handleEvent);
    };
  }, [loaded, onEnter]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#8b8ce6] overflow-hidden select-none font-sans">
      <AnimatePresence>
        {!exiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            {/* SPLINE CANVAS */}
            <div 
              className={`absolute inset-0 flex justify-end items-center transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
            >
              <canvas 
                ref={canvasRef} 
                onClick={() => {
                  if (!isActive && loaded) {
                    setIsActive(true);
                    const spline = appRef.current;
                    if (spline) {
                      const clickToType = spline.findObjectByName("Click to type");
                      const arrow = spline.findObjectByName("Arrow Cursor");
                      if (clickToType) clickToType.visible = false;
                      if (arrow) arrow.visible = false;
                    }
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }
                }}
                className={`w-[130%] h-full transition-all duration-700 ${isActive ? "cursor-none" : "cursor-pointer"}`} 
              />
            </div>

            {/* CINEMATIC GRADIENT OVERLAY (LEFT SIDE ONLY) */}
            <div 
              className="absolute left-0 top-0 h-full w-[45%] pointer-events-none z-[5]"
              style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%)"
              }}
            />

            {/* OVERLAY UI */}
            <div className="absolute bottom-20 left-12 max-w-[480px] pointer-events-none space-y-6 z-[10]">
              <div className="flex items-center gap-4">
                 <div className="h-px w-10 bg-white/40" />
                 <span 
                   className="text-[12px] font-black uppercase tracking-[0.5em] font-sans"
                   style={{ 
                     color: 'rgba(255,255,255,0.75)',
                     textShadow: '0 10px 40px rgba(0,0,0,0.35)'
                   }}
                 >
                   Cinematic Intake
                 </span>
              </div>
              
              <h1 
                className="text-white text-[clamp(48px,6vw,90px)] font-display font-bold leading-[0.9] tracking-tighter uppercase"
                style={{ textShadow: '0 10px 40px rgba(0,0,0,0.35)' }}
              >
                START <br /> LEARNING
              </h1>

              <div className="space-y-4">
                <p 
                  className="text-white text-sm tracking-[0.4em] uppercase font-black font-sans"
                  style={{ textShadow: '0 10px 40px rgba(0,0,0,0.35)' }}
                >
                  Focused. Minimal. Effective.
                </p>
                
                <div className="pt-6 transition-opacity duration-500" style={{ opacity: isActive ? 0.3 : 1 }}>
                  <p 
                    className="text-[11px] font-black uppercase tracking-[0.3em]"
                    style={{ 
                      color: 'rgba(255,255,255,0.5)',
                      textShadow: '0 10px 40px rgba(0,0,0,0.35)'
                    }}
                  >
                    {isActive ? "Type 'start' to proceed" : "Enter the sanctuary"}
                  </p>
                </div>
              </div>
            </div>

            {/* INVISIBLE INPUT */}
            <input
              ref={inputRef}
              className="absolute opacity-0 pointer-events-none"
              autoFocus
              onChange={() => {}}
              onBlur={() => {
                if (isActive && !isLoading) {
                  // Keep focus if active
                  setTimeout(() => inputRef.current?.focus(), 10);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING STATE FOR SPLINE */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#8b8ce6] z-50">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Initializing 3D Environment</span>
          </div>
        </div>
      )}
    </div>
  );
}
