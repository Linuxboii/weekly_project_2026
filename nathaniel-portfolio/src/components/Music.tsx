export default function Music() {
  return (
    <section id="music" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-10 max-w-2xl mx-auto text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#3b82f6]/5 rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-6">🎵</div>
            <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Beyond Work</p>
            <h2 className="text-3xl font-bold text-white mb-4">Music is my reset button.</h2>
            <p className="text-[#71717a] leading-relaxed max-w-md mx-auto">
              When I'm not closing deals or building pipelines, you'll find me deep in music.
              It's where creativity meets discipline — the same qualities that drive success in sales.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
