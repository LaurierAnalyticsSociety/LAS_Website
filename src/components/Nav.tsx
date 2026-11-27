import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { navLinks, siteHref } from '../data/site';
import { useActiveSection } from '../hooks/useActiveSection';

export function Nav({ isHome = true }: { isHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const sectionIds = useMemo(() => navLinks.filter((l) => l.href.startsWith('#')).map((l) => l.href.slice(1)), []);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header data-site-nav className="fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-cyan/20 bg-ink' : 'border-transparent bg-ink/85 backdrop-blur-[10px]'}`
        }>
        
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <a href={siteHref('#top', isHome)} onClick={() => setOpen(false)} className="group flex items-center gap-3" aria-label="Laurier Analytics Society, home">
            <Logo className="h-7 w-[63px]" interactive />
            <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-paper/55 transition-colors duration-300 group-hover:text-paper/80 xl:block">
              Laurier Analytics Society
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = isHome ? active === link.href.slice(1) : link.href === '/workshops/';
              return (
                <li key={link.href}>
                  <a
                    href={siteHref(link.href, isHome)}
                    aria-current={isActive ? (isHome ? 'location' : 'page') : undefined}
                    className={`group relative block px-3 py-2 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    isActive ? 'text-cyan' : 'text-paper/55 hover:text-paper'}`
                    }>
                    
                    {link.label}
                    <span
                      className={`absolute inset-x-3 bottom-1 h-px origin-left bg-cyan transition-transform duration-300 ease-out ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`
                      } />
                    
                  </a>
                </li>);

            })}
          </ul>

          <div className="flex items-center gap-2">
            <a href={siteHref('#newsletter', isHome)} className="btn-signal hidden h-10 px-5 text-[13px] sm:inline-flex" data-cursor="join">
              Join the society
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center border border-paper/10 text-paper/80 transition-colors duration-300 hover:border-cyan/40 hover:text-cyan md:hidden">
              
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
        <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-cyan/80" />
      </div>

      <AnimatePresence>
        {open ?
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-cyan/20 bg-ink md:hidden">
          
            <ul className="mx-auto max-w-[1400px] px-5 py-3 sm:px-8">
              {navLinks.map((link, i) =>
            <motion.li
              key={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}>
              
                  <a
                href={siteHref(link.href, isHome)}
                aria-current={!isHome && link.href === '/workshops/' ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-between border-b border-paper/5 py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-paper/80">
                
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-cyan/70" />
                  </a>
                </motion.li>
            )}
              <li>
                <a
                href={siteHref('#newsletter', isHome)}
                onClick={() => setOpen(false)}
                className="mt-3 flex min-h-12 items-center justify-between py-3 font-heading text-sm text-cyan">
                
                  Join the society
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </motion.div> :
        null}
      </AnimatePresence>
    </header>);

}
