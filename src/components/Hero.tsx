import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { AsciiField } from './AsciiField';

const EASE = [0.16, 1, 0.3, 1] as const;

interface HeroProps {
  /** Starts the entrance choreography (after the intro finishes). */
  ready?: boolean;
}

export function Hero({ ready = true }: HeroProps) {
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, delay, ease: EASE }
  });

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden border-b border-paper/10">
      <div className="absolute inset-0 -z-10 opacity-70">
        <AsciiField
          className="h-full w-full"
          cellWidth={10}
          cellHeight={16}
          speed={0.35}
          intensity={0}
          chroma={0.85}
          interactive />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(7,11,13,0.92)_0%,rgba(7,11,13,0.72)_38%,rgba(7,11,13,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.07)_0%,transparent_58%)]" />
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center px-5 py-24 text-center sm:px-8 sm:py-28">
        <motion.h1
          {...enter(0.1)}
          className="max-w-5xl font-display text-[clamp(2.25rem,10vw,3rem)] leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl lg:text-6xl">
          Laurier Analytics Society
        </motion.h1>

        <motion.p
          {...enter(0.22)}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-paper/60 sm:text-base">
          Wilfrid Laurier University&apos;s student-run data and analytics club in Waterloo, Ontario. Workshops,
          industry mentorship, and the annual LAS Datathon. Every program welcome.
        </motion.p>

        <motion.div {...enter(0.35)} className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 min-[380px]:w-auto min-[380px]:flex-row sm:mt-10">
          <a href="#newsletter" className="btn-signal" data-cursor="join">
            Join the society
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a href="#about" className="btn-ghost" data-cursor="scroll">
            What we do
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
