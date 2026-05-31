import { profile, skills, projects, education, training, achievements } from '../data.js';

export default function ResumeSheet() {
  return (
    <div id="resume-sheet" className="resume-sheet print-only mx-auto max-w-[820px] bg-white p-10 text-[12px] leading-snug text-black">
      <header className="border-b border-black/80 pb-4">
        <h1 className="text-[26px] font-bold tracking-tight">{profile.name}</h1>
        <p className="mt-1 text-[13px] font-medium">{profile.role}, AI Automation Agency</p>
        <p className="mt-2 text-[11px]">
          {profile.emailPrimary} · {profile.emailFallback} · {profile.phone} · {profile.location}
        </p>
        <p className="text-[11px]">
          LinkedIn: {profile.socials.linkedin} · GitHub: {profile.socials.github} · Web: {profile.socials.website}
        </p>
      </header>

      <Section title="Summary">
        <p>
          Founder of AvlokAI, an AI automation agency designing autonomous workflows, AI agents,
          and integrations for small and mid-sized businesses. Cybersecurity practitioner with
          hands-on experience in VAPT, SOC operations (Wazuh, Suricata, ELK), and digital forensics.
          Currently pursuing a B.Sc in Cognitive Systems at Loyola Academy.
        </p>
      </Section>

      <Section title="Core Skills: AI Automation">
        <ul className="ml-4 list-disc space-y-0.5">
          {skills.aiAutomation.map((s) => (
            <li key={s.name}><strong>{s.name}:</strong> {s.detail}</li>
          ))}
        </ul>
      </Section>

      <Section title="Core Skills: Cybersecurity">
        <ul className="ml-4 list-disc space-y-0.5">
          {skills.cybersecurity.map((s) => (
            <li key={s.name}><strong>{s.name}:</strong> {s.detail}</li>
          ))}
        </ul>
      </Section>

      <Section title="Tools">
        <p>{skills.tools.join(' · ')}</p>
      </Section>

      <Section title="Selected Projects">
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.title}>
              <p className="font-semibold">{p.title} <span className="font-normal italic">- {p.role}</span></p>
              <p>{p.summary}</p>
              <p className="text-[11px]"><em>Stack:</em> {p.stack.join(', ')}{p.link ? ` · ${p.link}` : ''}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Training">
        <ul className="space-y-1.5">
          {training.map((t) => (
            <li key={t.title}>
              <p><strong>{t.title}</strong>, {t.org} <span className="italic">({t.period})</span></p>
              <p>{t.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Education">
        <ul className="space-y-1">
          {education.map((e) => (
            <li key={e.title}>
              <strong>{e.title}</strong>, {e.org} <span className="italic">({e.period})</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Achievements">
        <ul className="ml-4 list-disc space-y-0.5">
          {achievements.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-4">
      <h2 className="border-b border-black/30 pb-1 text-[13px] font-bold uppercase tracking-wider">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
