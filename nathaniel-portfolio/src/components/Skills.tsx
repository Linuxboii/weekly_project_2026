const frontend = ['TypeScript', 'HTML', 'CSS', 'Tailwind CSS']
const sales = ['Lead Generation', 'Client Relations', 'Pipeline Management', 'Strategic Partnerships', 'Negotiation']

function SkillChip({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 glass-card rounded-full text-sm text-[#71717a] hover:text-white hover:border-[#3b82f6]/40 transition-all duration-200 cursor-default">
      {label}
    </span>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Skills</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          What I <span className="gradient-text">Bring</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-mono text-[#3b82f6] tracking-widest uppercase mb-5">Frontend Development</h3>
            <div className="flex flex-wrap gap-3">
              {frontend.map(s => <SkillChip key={s} label={s} />)}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-mono text-[#3b82f6] tracking-widest uppercase mb-5">Sales</h3>
            <div className="flex flex-wrap gap-3">
              {sales.map(s => <SkillChip key={s} label={s} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
