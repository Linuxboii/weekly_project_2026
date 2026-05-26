export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center px-6 pt-20 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 animated-grid opacity-30 pointer-events-none" />

      {/* Blue radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 relative z-10 py-16">
        {/* Left: Text */}
        <div className="flex-1 space-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[#71717a]">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse flex-shrink-0" />
            CRO @ AvlokAI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Nathaniel<br />
            <span className="gradient-text">Francis</span>
          </h1>

          <p className="text-xl text-[#71717a] max-w-md leading-relaxed">
            Chief Revenue Officer driving growth at AvlokAI. Multilingual. Sales-first. Building the future of intelligent automation.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="https://www.linkedin.com/in/nathaniel-francis"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              LinkedIn →
            </a>
            <a
              href="#contact"
              className="px-6 py-3 glass-card hover:bg-[#1f1f23] text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Right: Photo */}
        <div className="relative flex-shrink-0 order-1 lg:order-2">
          <div className="relative w-56 h-56 md:w-72 md:h-72">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-[#3b82f6]/20 blur-[40px]" />
            <img
              src="/nathan.jpg"
              alt="Nathaniel Francis, Chief Revenue Officer at AvlokAI"
              className="relative w-full h-full rounded-full object-cover border-2 border-[#3b82f6]/30 z-10"
            />
            {/* Outer decorative ring */}
            <div className="absolute inset-[-8px] rounded-full border border-[#3b82f6]/15 z-0" />
          </div>
        </div>
      </div>
    </section>
  )
}
