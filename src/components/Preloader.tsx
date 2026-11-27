import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogoMark } from './LogoMark';
import { WordReveal } from './WordReveal';

const STEPS = ['loading datasets', 'cleaning rows', 'fitting model', 'signal found'];
const DURATION = 2000;
const EASE = [0.76, 0, 0.24, 1] as const;

interface PreloaderProps {
  onDone: () => void;
}

export function Preloader({ onDone }: PreloaderProps) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    let raf = 0;
    let timeout = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);else
      timeout = window.setTimeout(() => setLeaving(true), 380);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => setLeaving(true);
    window.addEventListener('keydown', skip);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', skip);
      document.body.style.overflow = previous;
    };
  }, []);

  const step = STEPS[Math.min(STEPS.length - 1, Math.floor(pct / 100 * STEPS.length))];

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!leaving ?
      <motion.div
        key="preloader"
        data-preloader
        role="status"
        aria-live="polite"
        aria-label={`Loading Laurier Analytics Society, ${pct}%`}
        onClick={() => setLeaving(true)}
        data-cursor="skip"
        className="fixed inset-0 z-[150] flex cursor-pointer flex-col bg-ink text-paper"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.9, ease: EASE }}>
        
          <div className="flex items-center justify-between px-5 pt-6 font-mono text-[10.5px] uppercase tracking-[0.26em] text-paper/45 sm:px-8">
            <span>Waterloo, ON</span>
            <span>Est. 2021</span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-5">
            <div className="h-16 w-36 sm:h-20 sm:w-[180px]">
              <LogoMark draw />
            </div>
            <p aria-hidden="true" className="mt-8 text-center font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              <WordReveal text="Laurier Analytics *Society*" delay={0.35} immediate />
            </p>

            <div className="mt-12 w-full max-w-sm">
              <div className="h-px w-full bg-paper/10">
                <div className="h-px origin-left bg-cyan" style={{ transform: `scaleX(${pct / 100})` }} />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.22em]">
                <span className="text-paper/50">{step}</span>
                <span className="tabular-nums text-cyan">{String(pct).padStart(3, '0')}%</span>
              </div>
            </div>
          </div>

          <p className="pb-8 text-center font-mono text-[10.5px] uppercase tracking-[0.26em] text-paper/35">
            Click anywhere to skip
          </p>
        </motion.div> :
      null}
    </AnimatePresence>);

}