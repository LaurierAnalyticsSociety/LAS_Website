import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { team } from '../data/site';
import { heatmap, rgbCss } from '../utils/heatmap';

const CHARS = '.:-=+*#%@$&iIlZXU';
const COLS = 16;
const ROWS = 9;

function AsciiPortrait({ seed, hovered }: {seed: string;hovered: boolean;}) {
  const grid = useMemo(() => {
    let h = hash(seed);
    const cells: {ch: string;w: number;nx: number;ny: number;}[] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        h = Math.imul(h, 1103515245) + 12345 >>> 0;
        const r = h % 1000 / 1000;
        const dx = (x - COLS / 2 + 0.5) / (COLS / 2);
        const dy = (y - ROWS / 2 + 0.5) / (ROWS / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        const w = Math.max(0, 1 - d * 0.95) * (0.45 + r * 0.55);
        cells.push({ ch: CHARS[Math.floor(r * CHARS.length)], w, nx: x / (COLS - 1), ny: y / (ROWS - 1) });
      }
    }
    return cells;
  }, [seed]);

  return (
    <div
      aria-hidden="true"
      className="grid select-none font-mono text-[11px] leading-[1.15] min-[380px]:text-[8px] sm:text-[11px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
      
      {grid.map((cell, i) => {
        const t = hovered ? Math.min(1, cell.w * 1.55 + 0.12) : cell.w * 0.62;
        return (
          <span
            key={i}
            className="text-center transition-[color,opacity,transform] duration-300 ease-out"
            style={{
              color: rgbCss(heatmap(t, cell.nx, cell.ny)),
              opacity: hovered ? Math.min(1, cell.w * 1.6 + 0.12) : cell.w * 0.55 + 0.08,
              transform: hovered ? 'translateY(-1px)' : 'none'
            }}>
            
            {cell.ch}
          </span>);

      })}
    </div>);

}

export function Team() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="team" className="border-b border-paper/10 py-16 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          align="center"
          index="03 / Our Team"
          title="38 executives. *One team.*"
          description="Meet the portfolio leads, the people who run the workshops, wrangle the sponsors, and stay up late cleaning the datathon datasets." />
        
        <div className="mt-8 flex justify-center">
          <a href="#faq" className="btn-ghost">
            How to join the exec team
          </a>
        </div>

        <div className="mt-10 grid gap-px bg-paper/10 min-[380px]:grid-cols-2 sm:mt-14 lg:grid-cols-4">
          {team.map((member, i) =>
          <motion.article
            key={member.name}
            tabIndex={0}
            data-cursor="decode"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.65, delay: i % 4 * 0.07, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setActive(member.name)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(member.name)}
            onBlur={() => setActive(null)}
            
            className={`group relative min-w-0 overflow-hidden bg-panel p-4 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyan/70 sm:p-6 ${
              i === 12
                ? 'min-[380px]:col-span-2 min-[380px]:col-start-1 lg:col-span-1 lg:col-start-2'
                : ''
            }`}>
            
              <span className="pointer-events-none absolute inset-0 bg-cyan/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative overflow-hidden border border-paper/10 bg-ink/60 p-2 sm:p-4">
                <AsciiPortrait seed={member.name} hovered={active === member.name} />
              </div>
              <h3 className="relative mt-4 font-display text-[1.35rem] leading-tight text-paper sm:mt-5 sm:text-2xl">{member.name}</h3>
              <p className="relative mt-2 break-words font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 sm:mt-1 sm:text-[11px] sm:tracking-[0.18em]">{member.role}</p>
              {member.focus ?
              <p className="relative mt-2 text-[12px] leading-snug text-paper/45 sm:text-[13px]">{member.focus}</p> :
              null}
            </motion.article>
          )}
        </div>
      </div>
    </section>);

}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
