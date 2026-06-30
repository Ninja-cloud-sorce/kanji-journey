import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FloatingFlashcardProps {
  front: string;
  frontSub: string;
  back: string;
  backDetails?: string;
  isFlippedOverride?: boolean;
}

export function FloatingFlashcard({ front, frontSub, back, backDetails, isFlippedOverride }: FloatingFlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = isFlippedOverride !== undefined ? isFlippedOverride : internalFlipped;

  return (
    <div className="perspective-1000 w-full max-w-sm h-[32rem] cursor-pointer group" onClick={() => isFlippedOverride === undefined && setInternalFlipped(!internalFlipped)}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face: Deep Glassmorphism */}
        <div className="absolute inset-0 backface-hidden w-full h-full rounded-[2.5rem] glass-panel flex flex-col items-center justify-center p-12 transition-all duration-700 group-hover:bg-white/[0.08] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-4 border-[1px] border-white/5 rounded-[2.2rem] pointer-events-none" />
          
          <h2 className="text-9xl mb-12 font-jp font-light text-glow tracking-widest">{front}</h2>
          <p className="text-xl text-muted-foreground uppercase tracking-[0.6em] font-light">{frontSub}</p>
          
          {!isFlipped && (
            <div className="absolute bottom-12 opacity-20 group-hover:opacity-60 transition-opacity">
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Examine</span>
            </div>
          )}
        </div>

        {/* Back Face: Soft Gold Highlights */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full rounded-[2.5rem] border border-primary/20 bg-gradient-to-tl from-black via-white/[0.02] to-primary/5 shadow-[0_45px_100px_-20px_rgba(0,0,0,1)] backdrop-blur-3xl flex flex-col items-center justify-center p-12"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-4 border-[1px] border-primary/10 rounded-[2.2rem] pointer-events-none" />
          
          <div className="space-y-4 text-center">
             <p className="text-4xl text-primary font-light tracking-[0.1em]">{back}</p>
             <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full" />
          </div>
          
          {backDetails && (
            <p className="mt-8 text-lg text-muted-foreground font-light text-center leading-relaxed tracking-wider max-w-xs">
              {backDetails}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
