import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AsciiField } from './AsciiField';
import { SectionHeading } from './SectionHeading';
import { datathonYears } from '../data/site';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const EASE = [0.16, 1, 0.3, 1] as const;

interface DatathonProps {
  cellWidth?: number;
  cellHeight?: number;
}

interface YearPhoto {
  src: string;
  alt: string;
}

export function Datathon({ cellWidth = 10, cellHeight = 15 }: DatathonProps) {
  const reduced = usePrefersReducedMotion();
  const [yearId, setYearId] = useState(datathonYears[0].id);
  const year = datathonYears.find((item) => item.id === yearId) ?? datathonYears[0];

  return (
    <section id="datathon" className="relative isolate overflow-hidden border-b border-paper/10">
      <div className="absolute inset-0 -z-10 opacity-[0.55]">
        <AsciiField
          className="h-full w-full"
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          speed={0.5}
          intensity={0}
          chroma={0.7}
          interactive={false} />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#070b0d_0%,rgba(7,11,13,0.88)_55%,rgba(7,11,13,0.62)_100%)]" />

      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-32">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:gap-20">
          <div className="text-center">
            <SectionHeading align="center" index="02 / Flagship" title="LAS Datathon" />

            <div
              role="tablist"
              aria-label="Datathon year"
              className="mt-7 inline-flex border border-paper/15 sm:mt-8">
              {datathonYears.map((item) => {
                const selected = item.id === year.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setYearId(item.id)}
                    className={`min-h-11 px-5 py-2 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                      selected ? 'bg-cyan text-ink' : 'text-paper/55 hover:text-paper'
                    }`}>
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid">
              {datathonYears.map((item) => {
                const active = item.id === year.id;
                return (
                  <div
                    key={item.id}
                    className={`col-start-1 row-start-1 ${reduced ? '' : 'transition-opacity duration-200 ease-out'}`}
                    style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
                    aria-hidden={!active}
                    inert={!active ? '' : undefined}>
                    <h3 className="font-display text-2xl tracking-[-0.01em] text-paper sm:text-[1.75rem]">{item.title}</h3>
                    <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-paper/60">{item.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid self-center">
            {datathonYears.map((item) => {
              const active = item.id === year.id;
              return (
                <div
                  key={item.id}
                  className={`col-start-1 row-start-1 h-full ${reduced ? '' : 'transition-opacity duration-200 ease-out'}`}
                  style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none' }}
                  aria-hidden={!active}
                  inert={!active ? '' : undefined}>
                  {item.images.length > 0 ?
                    <PhotoReel images={item.images} /> :
                    <div className="h-full border border-paper/10 bg-panel" />
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhotoReel({ images }: { images: YearPhoto[] }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const count = images.length;
  const photo = images[index];

  const step = (direction: 1 | -1) => {
    setDir(direction);
    setIndex((current) => (current + direction + count) % count);
  };

  return (
    <figure className="border border-paper/10 bg-panel shadow-[0_40px_120px_-60px_rgba(94,234,212,0.22)]">
      <div className="group relative aspect-[4/3] overflow-hidden bg-ink">
        <AnimatePresence initial={false} custom={dir}>
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            custom={dir}
            variants={{
              enter: (direction: number) => ({ opacity: 0, x: reduced ? 0 : direction * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (direction: number) => ({ opacity: 0, x: reduced ? 0 : direction * -40 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => step(1)}
          className="absolute inset-0 cursor-pointer" />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(-1);
          }}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-paper/15 bg-ink/70 text-paper/80 backdrop-blur-sm transition-colors duration-300 hover:border-cyan/40 hover:text-cyan">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(1);
          }}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-paper/15 bg-ink/70 text-paper/80 backdrop-blur-sm transition-colors duration-300 hover:border-cyan/40 hover:text-cyan">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <figcaption className="flex min-h-14 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-1">
          {images.map((image, dot) =>
            <button
              key={image.src}
              type="button"
              aria-label={`Photo ${dot + 1} of ${count}`}
              aria-current={dot === index ? 'true' : undefined}
              onClick={() => {
                setDir(dot > index ? 1 : -1);
                setIndex(dot);
              }}
              className="group grid h-11 w-11 place-items-center">
              <span className={`block h-1.5 transition-all duration-500 ease-out ${
                dot === index ? 'w-6 bg-cyan' : 'w-1.5 bg-paper/25 group-hover:bg-paper/50'
              }`} />
            </button>
          )}
        </div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-paper/45">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
      </figcaption>
    </figure>
  );
}
