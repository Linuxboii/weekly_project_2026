import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '../data.js';
import NavHeader from './NavHeader.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-canvas text-sm font-bold tracking-tight">
            SK
          </span>
          <span className="font-display text-lg leading-none">Sushanth Kasturi</span>
        </Link>

        <div className="hidden md:block">
          <NavHeader />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            className="md:hidden rounded-md p-2 text-ink"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line bg-canvas">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-3 text-sm border-b border-line last:border-0 ${
                    isActive ? 'text-ink font-medium' : 'text-muted'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
