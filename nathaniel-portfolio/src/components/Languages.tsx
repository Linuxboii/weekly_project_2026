const languages = [
  { name: 'English', level: 'Fluent', flag: '🇬🇧' },
  { name: 'Hindi', level: 'Native', flag: '🇮🇳' },
  { name: 'Telugu', level: 'Native', flag: '🇮🇳' },
  { name: 'Tamil', level: 'Fluent', flag: '🇮🇳' },
]

export default function Languages() {
  return (
    <section id="languages" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Languages</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          I speak <span className="gradient-text">4 languages</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {languages.map(lang => (
            <div
              key={lang.name}
              className="glass-card rounded-2xl p-6 text-center hover:border-[#3b82f6]/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="text-3xl mb-3">{lang.flag}</div>
              <h3 className="text-lg font-semibold text-white">{lang.name}</h3>
              <p className="text-sm text-[#71717a] mt-1">{lang.level}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
