export default function RoleAtAvlokai() {
  const responsibilities = [
    'Lead and empower the AvlokAI sales team to consistently hit revenue targets',
    'Forge strategic partnerships with enterprise clients across industries',
    'Build and manage the full sales pipeline from prospecting to close',
    'Represent AvlokAI at client meetings and drive brand presence',
  ]

  return (
    <section id="role" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          Role at <span className="gradient-text">AvlokAI</span>
        </h2>

        <div className="glass-card rounded-2xl p-8 border-l-4 border-[#3b82f6] max-w-3xl">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Chief Revenue Officer</h3>
              <p className="text-[#3b82f6] font-mono text-sm mt-1">AvlokAI · 2025 – Present</p>
            </div>
            <a
              href="https://avlokai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#71717a] hover:text-[#3b82f6] transition-colors duration-200 flex-shrink-0"
            >
              avlokai.com ↗
            </a>
          </div>

          <ul className="space-y-3">
            {responsibilities.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[#71717a] leading-relaxed">
                <span className="text-[#3b82f6] mt-1 flex-shrink-0 text-xs">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
