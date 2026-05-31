import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { profile, services } from '../data.js';
import Reveal, { StaggerGroup, StaggerItem } from '../components/Reveal.jsx';

export default function Home() {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-32 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {profile.tagline}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
              {profile.name}.
              <br />
              <span className="text-muted">Founder, AvlokAI.</span>
            </h1>
            <p className="mt-8 max-w-prose text-lg leading-relaxed text-ink/80">
              {profile.pitch}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas transition hover:bg-accent"
              >
                See selected work <ArrowUpRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-medium text-ink transition hover:border-ink"
              >
                <Mail size={16} /> Get in touch
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="relative mx-auto max-w-[320px] lg:max-w-none">
              <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-2xl bg-accent-soft" aria-hidden />
              <div className="overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-accent-soft to-canvas">
                <img
                  src="./sushanth.png"
                  alt="Sushanth Kasturi"
                  className="block h-auto w-full select-none object-cover"
                  draggable={false}
                />
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm lg:grid-cols-1">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Now</dt>
                <dd className="mt-1">Running AvlokAI</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Based</dt>
                <dd className="mt-1">{profile.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Studying</dt>
                <dd className="mt-1">B.Sc Cognitive Systems</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Also</dt>
                <dd className="mt-1">VAPT · SOC · Forensics</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Services */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-baseline justify-between gap-6">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">What I do</h2>
            <Link to="/skills" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">
              All skills →
            </Link>
          </div>
          <StaggerGroup className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {services.map((s) => (
              <StaggerItem key={s.title} className="bg-canvas p-6">
                <h3 className="font-display text-xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA strip */}
      <section>
        <Reveal>
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
            <p className="max-w-xl font-display text-2xl leading-snug sm:text-3xl">
              Have a workflow that feels like it should be automated? It probably can be.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-accent"
            >
              Start a conversation <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
