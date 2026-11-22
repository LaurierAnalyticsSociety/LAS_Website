import React, { useEffect, useState } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Datathon } from './components/Datathon';
import { Team } from './components/Team';
import { Faq } from './components/Faq';
import { Newsletter } from './components/Newsletter';
import { Sponsors } from './components/Sponsors';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { SmoothScroll } from './components/SmoothScroll';

type AsciiDensity = 'fine' | 'standard' | 'bold';

interface AppProps {
  asciiDensity?: AsciiDensity;
  showIntro?: boolean;
  customCursor?: boolean;
}

const DENSITY: Record<AsciiDensity, {w: number;h: number;}> = {
  fine: { w: 7, h: 11 },
  standard: { w: 9, h: 14 },
  bold: { w: 13, h: 19 }
};

export function App({
  asciiDensity = 'standard',
  showIntro = true,
  customCursor = true
}: AppProps) {
  const [introDone, setIntroDone] = useState(
    () =>
      !showIntro ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!showIntro) setIntroDone(true);
  }, [showIntro]);

  const cell = DENSITY[asciiDensity];

  return (
    <SmoothScroll>
      <div className="min-h-screen w-full bg-ink font-heading text-paper antialiased">
        <CustomCursor enabled={customCursor} />
        {!introDone ? <Preloader onDone={() => setIntroDone(true)} /> : null}
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-cyan focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Nav />
        <main>
          <Hero ready={introDone} />
          <About />
          <Datathon cellWidth={cell.w + 1} cellHeight={cell.h + 1} />
          <Team />
          <Faq />
          <Newsletter cellWidth={cell.w} cellHeight={cell.h} />
          <Sponsors cellWidth={cell.w} cellHeight={cell.h} />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );

}