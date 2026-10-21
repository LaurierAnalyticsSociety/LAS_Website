import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { AsciiField } from './AsciiField';
import { Reveal } from './Reveal';
import { WordReveal } from './WordReveal';
import { subscribe, type SubscribeResult } from '../utils/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterProps {
  cellWidth?: number;
  cellHeight?: number;
}

export function Newsletter({ cellWidth = 9, cellHeight = 14 }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('Enter a valid email address to continue.');
  const [result, setResult] = useState<SubscribeResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    const trimmed = email.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setErrorMsg('Enter a valid email address to continue.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const result = await subscribe({
        email: trimmed,
        type: 'newsletter',
        source: 'newsletter_section',
      });
      if (result.ok) {
        setResult(result);
        setStatus('success');
      } else {
        setErrorMsg(result.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setEmail('');
    setResult(null);
    setStatus('idle');
  };

  // Only claim an email went out when the function says it did.
  const successTitle = result?.already_subscribed
    ? "You're already on the list."
    : "You're on the list. Welcome to LAS.";
  const successDetail = result?.already_subscribed
    ? `${email} is already subscribed.`
    : result?.email_sent
      ? `Confirmation sent to ${email}`
      : `Subscribed ${email}. We couldn't send a confirmation email right now.`;

  return (
    <section id="newsletter" className="relative isolate overflow-hidden border-b border-paper/10">
      <div className="absolute inset-0 -z-10 opacity-40">
        <AsciiField
          className="h-full w-full"
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          speed={0.6}
          intensity={0}
          chroma={0.65}
          interactive={false} />
        
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(7,11,13,0.55)_0%,#070b0d_72%)]" />

      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">05 / Join us</p>
          </Reveal>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,11vw,3rem)] leading-[1.05] tracking-tight text-paper sm:text-7xl">
            <WordReveal text="Stay in *the loop.*" delay={0.05} />
          </h2>
          <Reveal delay={0.12}>
            <p className="mt-4 text-[15px] leading-relaxed text-paper/60">
              Membership is free and starts here. Every two weeks: upcoming events, exec applications, internship
              postings, and one chart worth your attention. Unsubscribe in one click.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="relative mx-auto mt-10 max-w-lg">
              <AnimatePresence mode="wait" initial={false}>
                {status === 'success' ?
                <motion.div
                  key="success"
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-3 border border-cyan/25 bg-cyan/[0.06] px-4 py-5 text-left sm:flex-nowrap sm:gap-4 sm:px-6">
                  
                    <span className="grid h-9 w-9 shrink-0 place-items-center bg-cyan text-ink">
                      <Check className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm text-paper">{successTitle}</p>
                      <p className="mt-1 break-all font-mono text-[11px] text-paper/50">{successDetail}</p>
                    </div>
                    <button
                    type="button"
                    onClick={reset}
                    className="ml-12 min-h-11 shrink-0 font-mono text-[10.5px] uppercase tracking-[0.18em] text-paper/45 transition-colors hover:text-cyan sm:ml-0">
                    
                      Add another
                    </button>
                  </motion.div> :

                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex min-w-0 flex-col gap-2 sm:flex-row"
                  noValidate>
                  
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="you@mylaurier.ca"
                    aria-invalid={status === 'error'}
                    aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                    className={`h-12 min-w-0 flex-1 border bg-paper/[0.03] px-4 font-mono text-[16px] text-paper outline-none transition-all duration-300 placeholder:text-paper/30 focus:bg-paper/[0.06] sm:text-[13px] ${
                    status === 'error' ? 'border-heat/70 focus:border-heat' : 'border-paper/15 focus:border-cyan/55'}`
                    } />
                  
                    <button
                    type="submit"
                    disabled={status === 'loading'}
                    data-cursor="send"
                    className="btn-signal disabled:opacity-70">
                    
                      {status === 'loading' ?
                    <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Subscribing
                        </> :

                    <>
                          Subscribe
                          <ArrowRight className="h-4 w-4" />
                        </>
                    }
                    </button>
                  </motion.form>
                }
              </AnimatePresence>

              <AnimatePresence>
                {status === 'error' ?
                <motion.p
                  id="newsletter-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 flex items-start justify-center gap-2 font-mono text-[11px] leading-relaxed text-heat"
                  role="alert">
                  
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {errorMsg}
                  </motion.p> :
                null}
              </AnimatePresence>

              <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-paper/35">
                2,400 students subscribed
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>);

}
