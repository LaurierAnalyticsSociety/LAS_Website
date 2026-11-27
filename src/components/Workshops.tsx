import { Play, NotebookPen } from 'lucide-react';
import { workshops, workshopPage } from '../data/site';
import { Newsletter } from './Newsletter';

export function Workshops() {
  return (
    <div id="top">
      <section className="relative overflow-hidden border-b border-paper/10 pb-8 pt-24 sm:pb-10 sm:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(94,234,212,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(94,234,212,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">
            LAS / Workshops <span className="h-px w-10 bg-cyan/40" aria-hidden="true" />
          </p>
          <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.15rem,9vw,2.6rem)] leading-[1.12] tracking-[-0.01em] text-paper sm:mt-12 sm:text-[3.5rem]">
            Find your next <em className="text-cyan">skill.</em>
          </h1>
          <div className="mt-5 space-y-5">
            <p className="text-[15px] leading-relaxed text-paper/65 lg:whitespace-nowrap">{workshopPage.introduction}</p>
          </div>
        </div>
      </section>

      <section id="workshop-library" aria-labelledby="workshop-heading" className="border-b border-paper/10 py-8 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 id="workshop-heading" className="font-mono text-sm uppercase tracking-[0.2em] text-paper/70">Watch & learn</h2>
            <span className="font-mono text-sm text-paper/40">{workshops.length} {workshops.length === 1 ? 'workshop' : 'workshops'}</span>
          </div>
          <div className="space-y-10">
            {workshops.map((workshop) => (
              <article key={workshop.youtubeId} aria-labelledby={`workshop-${workshop.youtubeId}`} className="overflow-hidden border border-paper/10 bg-panel">
                <div className="flex flex-wrap items-center justify-between gap-5 border-b border-paper/10 px-4 py-5 sm:px-8 sm:py-6">
                  <h3 id={`workshop-${workshop.youtubeId}`} className="whitespace-nowrap font-display text-[clamp(0.875rem,3.6vw,1.875rem)] leading-[1.2] text-paper">{workshop.title}</h3>
                  <a className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-cyan transition-colors duration-150 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan" href={`https://www.youtube.com/watch?v=${workshop.youtubeId}`} target="_blank" rel="noopener noreferrer">
                    <Play className="h-3.5 w-3.5" aria-hidden="true" /> Watch on YouTube<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
                <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                <div className="aspect-video min-w-0 bg-ink">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${workshop.youtubeId}`}
                    title={workshop.title}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <aside aria-label="Workshop learning guide" className="min-w-0 border-t border-paper/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-3 text-cyan/70">
                    <NotebookPen className="h-4 w-4" aria-hidden="true" />
                    <h4 className="font-mono text-[11px] uppercase tracking-[0.2em]">Make it stick</h4>
                  </div>
                  <p className="mt-4 font-display text-2xl text-paper sm:text-3xl">A little practice goes a long way.</p>
                  <ul className="mt-6 space-y-5">
                    {workshopPage.guide.map((item) => (
                      <li key={item.title} className="border-l border-paper/15 pl-4">
                        <p className="text-sm font-medium text-paper/85">{item.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-paper/50">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </aside>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 grid items-center gap-8 border-t border-paper/10 pt-8 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl text-paper sm:text-3xl">Your next skill starts here.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/60">{workshopPage.updates}</p>
            </div>
            <Newsletter compact source="workshops_page" />
          </div>
        </div>
      </section>
    </div>
  );
}
