import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Role', href: '#role' },
    { label: 'Skills', href: '#skills' },
    { label: 'Music', href: '#music' },
    { label: 'Languages', href: '#languages' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-[#27272a]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="font-semibold text-white tracking-tight">Nathaniel Francis</span>
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#71717a] hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
