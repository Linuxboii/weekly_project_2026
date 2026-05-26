const languages = [
  { name: 'English', level: 'Fluent', initials: 'EN' },
  { name: 'Hindi', level: 'Native', initials: 'HI' },
  { name: 'Telugu', level: 'Native', initials: 'TE' },
  { name: 'Tamil', level: 'Fluent', initials: 'TA' },
]

export default function Languages() {
  return (
    <section id="languages" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          I speak <span className="gradient-text">4 languages</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {languages.map(lang => (
            <div
              key={lang.name}
              className="glass-card rounded-2xl p-6 text-center hover:border-[#3b82f6]/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="w-12 h-12 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-sm font-semibold text-[#3b82f6]">{lang.initials}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{lang.name}</h3>
              <p className="text-sm text-[#71717a] mt-1">{lang.level}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
