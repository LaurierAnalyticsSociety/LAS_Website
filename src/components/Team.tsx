import { motion } from 'framer-motion';
import { Database, KeyRound, Users } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { team } from '../data/site';

export function Team() {
  return (
    <section id="team" className="relative overflow-hidden border-b border-paper/10 py-16 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(transparent, black 25%, black 85%, transparent)'
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeading
          align="center"
          index="03 / Our Team"
          title={`${team.length} executives. *One team.*`}
          description="Different portfolios. A shared purpose. Meet the people connecting the dots behind Laurier Analytics Society." />

        <div className="mt-8 flex justify-center">
          <a href="#faq" className="btn-ghost">
            How to join the exec team
          </a>
        </div>

        <div className="mt-10 overflow-hidden rounded-sm border border-cyan/20 bg-ink sm:mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan/20 bg-cyan/[0.04] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Database aria-hidden="true" className="h-4 w-4 text-cyan" />
              <span className="font-mono text-xs text-paper sm:text-sm">
                <span className="text-paper/40">las / </span>executive_team
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan/80">
              <Users aria-hidden="true" className="h-3.5 w-3.5" />
              {team.length} people · one team
            </div>
          </div>

          <div className="grid gap-px bg-cyan/15 min-[380px]:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i % 3 * 0.06 }}
                className="group relative min-w-0 bg-panel transition-colors duration-300 hover:bg-lift"
              >
                <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3 font-mono text-[10px] sm:px-5">
                  <span className="flex items-center gap-2 text-cyan/80">
                    <KeyRound aria-hidden="true" className="h-3 w-3" />
                    <span className="sr-only">Member ID: </span>LAS_{String(i + 1).padStart(3, '0')}
                  </span>
                  <span aria-hidden="true" className="text-paper/30">{String(i + 1).padStart(2, '0')} / {String(team.length).padStart(2, '0')}</span>
                </div>

                <div className="p-3 sm:p-5">
                  <div className="relative aspect-square overflow-hidden border border-paper/10 bg-ink">
                    <img
                      src={member.image}
                      alt={`Portrait of ${member.name}`}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: member.imagePosition ?? 'top' }}
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-cyan" />
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-cyan" />
                  </div>

                  <div className="mt-5">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/40">name</span>
                    <h3 className="mt-1 font-heading text-lg font-medium leading-tight tracking-tight text-paper sm:text-2xl">{member.name}</h3>
                  </div>
                  <dl className="mt-4 border-t border-paper/10 pt-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/40">role</dt>
                    <dd className="mt-1.5 break-words font-mono text-[11px] leading-relaxed text-cyan sm:text-xs">{member.role}</dd>
                  </dl>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cyan/20 px-4 py-3 font-mono text-[9px] text-paper/40 sm:px-6 sm:text-[10px]">
            <span>Laurier Analytics Society</span>
            <span>{team.length} records / executive team</span>
          </div>
        </div>
      </div>
    </section>
  );
}
