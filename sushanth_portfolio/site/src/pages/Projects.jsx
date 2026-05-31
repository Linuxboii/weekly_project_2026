import { ArrowUpRight } from 'lucide-react';
import { PageShell } from '../components/Section.jsx';
import { projects } from '../data.js';
import { StaggerGroup, StaggerItem } from '../components/Reveal.jsx';

export default function Projects() {
  return (
    <PageShell
      eyebrow="Projects"
      title="Selected work."
      lede="A mix of AvlokAI builds, AI automation demos, and cybersecurity labs. Client projects are anonymized or omitted; everything below is mine to talk about."
    >
      <StaggerGroup className="divide-y divide-line border-y border-line" stagger={0.12}>
        {projects.map((p) => (
          <StaggerItem key={p.title} className="grid gap-6 py-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">{p.role}</p>
            </div>
            <div className="lg:col-span-9">
              <div className="flex items-start justify-between gap-6">
                <h3 className="font-display text-2xl tracking-tight sm:text-3xl">{p.title}</h3>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
                  >
                    Visit <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink/85">{p.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-accent"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </PageShell>
  );
}
