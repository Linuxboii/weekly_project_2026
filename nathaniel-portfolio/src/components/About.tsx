export default function About() {
  const stats = [
    { label: '2nd Year', sub: 'Loyola Academy' },
    { label: '4 Languages', sub: 'Multilingual' },
    { label: 'CRO', sub: 'AvlokAI' },
  ]

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Early career.<br />
              <span className="gradient-text">High trajectory.</span>
            </h2>
            <p className="text-[#71717a] text-lg leading-relaxed">
              I'm a 2nd year BSc student in Cognitive Systems & Computer Science at Loyola Academy, Hyderabad.
              While still in college, I serve as Chief Revenue Officer at AvlokAI — leading the entire sales engine
              and forging partnerships that bring intelligent automation to enterprises.
            </p>
            <p className="text-[#71717a] text-lg leading-relaxed">
              I bridge technical depth and human connection — fluent in four languages, experienced in sales,
              and passionate about building relationships that drive real growth.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-6 text-center hover:border-[#3b82f6]/40 transition-colors duration-300">
                <p className="text-xl font-bold text-white">{stat.label}</p>
                <p className="text-sm text-[#71717a] mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
