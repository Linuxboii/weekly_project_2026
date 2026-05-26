export default function Contact() {
  return (
    <section id="contact" className="relative py-24 px-6">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Contact</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Let's build something <span className="gradient-text">together.</span>
        </h2>
        <p className="text-[#71717a] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Whether it's a business opportunity, partnership, or just a conversation — I'm always open.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:nathaniel@avlokai.com"
            className="px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium rounded-lg transition-all duration-200"
          >
            Send an Email
          </a>
          <a
            href="https://www.linkedin.com/in/nathaniel-francis"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 glass-card hover:bg-[#1f1f23] text-white font-medium rounded-lg transition-all duration-200"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
    </section>
  )
}
