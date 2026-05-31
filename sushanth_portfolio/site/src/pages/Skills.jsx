import { PageShell, SectionTitle } from '../components/Section.jsx';
import { skills } from '../data.js';
import Reveal, { StaggerGroup, StaggerItem } from '../components/Reveal.jsx';

function SkillList({ items }) {
  return (
    <StaggerGroup className="divide-y divide-line border-t border-line">
      {items.map((s) => (
        <StaggerItem key={s.name} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <p className="font-medium">{s.name}</p>
          <p className="text-sm text-muted sm:max-w-md sm:text-right">{s.detail}</p>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

export default function Skills() {
  return (
    <PageShell
      eyebrow="Skills"
      title="What I build with."
      lede="Two practices, one operator. AI automation pays the bills today; cybersecurity is how I learned to think about systems."
    >
      <div className="grid gap-16 lg:grid-cols-2">
        <section>
          <SectionTitle kicker="Primary">AI Automation</SectionTitle>
          <SkillList items={skills.aiAutomation} />
        </section>
        <section>
          <SectionTitle kicker="Foundation">Cybersecurity</SectionTitle>
          <SkillList items={skills.cybersecurity} />
        </section>
      </div>

      <section className="mt-20">
        <SectionTitle>Tools & Stack</SectionTitle>
        <StaggerGroup className="flex flex-wrap gap-2" stagger={0.03}>
          {skills.tools.map((t) => (
            <StaggerItem key={t} className="rounded-full border border-line px-3 py-1.5 text-sm text-ink/80">
              {t}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </PageShell>
  );
}
