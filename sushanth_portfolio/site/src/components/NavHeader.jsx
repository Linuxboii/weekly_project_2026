import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { navLinks } from '../data.js';

export default function NavHeader() {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      className="relative mx-auto flex w-fit items-center rounded-full border border-ink/90 bg-canvas p-1"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {navLinks.map((l) => (
        <Tab key={l.to} to={l.to} setPosition={setPosition}>
          {l.label}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
}

function Tab({ to, children, setPosition }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="group relative z-10 block cursor-pointer"
    >
      <NavLink
        to={to}
        end={to === '/'}
        className={`block px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 md:px-5 md:py-2.5 md:text-xs text-ink group-hover:text-canvas ${
          isActive ? 'font-semibold' : ''
        }`}
      >
        {children}
      </NavLink>
    </li>
  );
}

function Cursor({ position }) {
  return (
    <motion.li
      animate={position}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="pointer-events-none absolute left-0 top-1/2 z-0 h-7 -translate-y-1/2 rounded-full bg-ink md:h-9"
    />
  );
}
