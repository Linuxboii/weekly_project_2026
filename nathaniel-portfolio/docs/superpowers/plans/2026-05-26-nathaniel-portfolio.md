# Nathaniel Francis Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Vite + React + TypeScript + Tailwind portfolio for Nathaniel Francis (CRO at AvlokAI) with sections: Navbar, Hero, About, Role at AvlokAI, Skills, Music, Languages, Contact.

**Architecture:** Single-page app with no routing. Eight focused component files, one per section. Global CSS vars drive the design system (black bg, electric blue accent). No external component libraries — raw Tailwind only.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | HTML entrypoint, meta tags |
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite + React plugin config |
| `tailwind.config.ts` | Tailwind content paths |
| `postcss.config.js` | PostCSS with Tailwind + autoprefixer |
| `tsconfig.json` | TypeScript compiler options |
| `public/nathan.jpg` | Profile photo (moved from root) |
| `src/main.tsx` | React DOM entry point |
| `src/index.css` | CSS vars, utility classes, animated grid |
| `src/App.tsx` | Root layout — composes all sections |
| `src/components/Navbar.tsx` | Sticky nav, glass blur on scroll |
| `src/components/Hero.tsx` | Full-viewport hero, photo + text split |
| `src/components/About.tsx` | Bio + stats row |
| `src/components/RoleAtAvlokai.tsx` | Featured glass card for CRO role |
| `src/components/Skills.tsx` | Frontend + Sales skill chips |
| `src/components/Music.tsx` | Personal music section |
| `src/components/Languages.tsx` | 4 language badge cards |
| `src/components/Contact.tsx` | Email + LinkedIn CTAs |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `public/` directory, move `nathan.jpg` into it

- [ ] **Step 1: Move the photo into public/**

```bash
mkdir public
move nathan.jpg public\nathan.jpg
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "nathaniel-portfolio",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Step 5: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/nathan.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Nathaniel Francis — Chief Revenue Officer at AvlokAI. Sales leader, multilingual, frontend developer." />
    <title>Nathaniel Francis</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 9: Commit**

```bash
git add index.html package.json vite.config.ts tailwind.config.ts postcss.config.js tsconfig.json public/nathan.jpg
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Global Styles + Entry Point

**Files:**
- Create: `src/index.css`
- Create: `src/main.tsx`

- [ ] **Step 1: Create `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #000000;
  --foreground: #fafafa;
  --accent: #3b82f6;
  --accent-dim: #2563eb;
  --muted: #71717a;
  --border: #27272a;
  --card: #18181b;
  --card-hover: #1f1f23;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}

body {
  color: var(--foreground);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--background); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--muted); }

.gradient-text {
  background: linear-gradient(135deg, var(--accent) 0%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
}

.animated-grid {
  background-image:
    linear-gradient(rgba(39, 39, 42, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(39, 39, 42, 0.4) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}
```

- [ ] **Step 2: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/main.tsx
git commit -m "feat: add global styles and React entry point"
```

---

## Task 3: App Shell

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: Create `src/App.tsx`**

```tsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import RoleAtAvlokai from './components/RoleAtAvlokai'
import Skills from './components/Skills'
import Music from './components/Music'
import Languages from './components/Languages'
import Contact from './components/Contact'

export default function App() {
  return (
    <main className="relative bg-black min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <RoleAtAvlokai />
      <Skills />
      <Music />
      <Languages />
      <Contact />
      <footer className="py-8 px-6 border-t border-[#27272a] text-center text-sm text-[#71717a]">
        © {new Date().getFullYear()} Nathaniel Francis · Built with ♥ at AvlokAI
      </footer>
    </main>
  )
}
```

Note: Components don't exist yet — TypeScript will error. That's expected. Resolve in subsequent tasks.

- [ ] **Step 2: Create stub files so TypeScript resolves**

Create `src/components/Navbar.tsx`, `Hero.tsx`, `About.tsx`, `RoleAtAvlokai.tsx`, `Skills.tsx`, `Music.tsx`, `Languages.tsx`, `Contact.tsx` — each with a minimal stub:

```tsx
export default function Navbar() { return <div /> }
```

(Repeat for each component, changing the function name to match the file.)

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite starts at `http://localhost:5173`, blank black page visible in browser, no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/
git commit -m "feat: add App shell and component stubs"
```

---

## Task 4: Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Implement Navbar**

```tsx
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
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:5173`. Expected: "Nathaniel Francis" text visible top-left, nav links visible on desktop. Scroll down — nav gets glass blur border. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add sticky Navbar with scroll blur effect"
```

---

## Task 5: Hero

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: Implement Hero**

```tsx
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
```

- [ ] **Step 2: Update LinkedIn URL**

In `Hero.tsx`, replace `https://www.linkedin.com/in/nathaniel-francis` with Nathaniel's actual LinkedIn URL once confirmed.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. Expected: photo visible right, name + text left, animated grid bg, blue glow pulse badge, two CTA buttons. On mobile: photo stacks above text.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: add Hero section with photo, animated grid, and CTAs"
```

---

## Task 6: About

**Files:**
- Modify: `src/components/About.tsx`

- [ ] **Step 1: Implement About**

```tsx
export default function About() {
  const stats = [
    { label: '2nd Year', sub: 'Loyola Academy' },
    { label: '4 Languages', sub: 'Multilingual' },
    { label: 'CRO', sub: 'AvlokAI' },
  ]

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">About</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Bio */}
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

          {/* Stats */}
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
```

- [ ] **Step 2: Verify in browser**

Scroll to About section. Expected: two-col layout on desktop, stacks on mobile. Three stat cards visible. Section has `id="about"` so nav link scrolls to it.

- [ ] **Step 3: Commit**

```bash
git add src/components/About.tsx
git commit -m "feat: add About section with bio and stats"
```

---

## Task 7: Role at AvlokAI

**Files:**
- Modify: `src/components/RoleAtAvlokai.tsx`

- [ ] **Step 1: Implement RoleAtAvlokai**

```tsx
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
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Experience</p>
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
```

- [ ] **Step 2: Verify in browser**

Scroll to Role section. Expected: single glass card with blue left border, role title, date, 4 bullet responsibilities, link to avlokai.com.

- [ ] **Step 3: Commit**

```bash
git add src/components/RoleAtAvlokai.tsx
git commit -m "feat: add Role at AvlokAI section"
```

---

## Task 8: Skills

**Files:**
- Modify: `src/components/Skills.tsx`

- [ ] **Step 1: Implement Skills**

```tsx
const frontend = ['TypeScript', 'HTML', 'CSS', 'Tailwind CSS']
const sales = ['Lead Generation', 'Client Relations', 'Pipeline Management', 'Strategic Partnerships', 'Negotiation']

function SkillChip({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 glass-card rounded-full text-sm text-[#71717a] hover:text-white hover:border-[#3b82f6]/40 transition-all duration-200 cursor-default">
      {label}
    </span>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#3b82f6] font-mono text-sm tracking-widest uppercase mb-3">Skills</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12">
          What I <span className="gradient-text">Bring</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-mono text-[#3b82f6] tracking-widest uppercase mb-5">Frontend Development</h3>
            <div className="flex flex-wrap gap-3">
              {frontend.map(s => <SkillChip key={s} label={s} />)}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-mono text-[#3b82f6] tracking-widest uppercase mb-5">Sales</h3>
            <div className="flex flex-wrap gap-3">
              {sales.map(s => <SkillChip key={s} label={s} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify in browser**

Scroll to Skills. Expected: two side-by-side groups, chip tags for each skill, hover brightens chip and adds blue border.

- [ ] **Step 3: Commit**

```bash
git add src/components/Skills.tsx
git commit -m "feat: add Skills section with frontend and sales chips"
```

---

## Task 9: Music

**Files:**
- Modify: `src/components/Music.tsx`

- [ ] **Step 1: Implement Music**

```tsx
export default function Music() {
  return (
    <section id="music" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-10 max-w-2xl mx-auto text-center relative overflow-hidden">
          {/* Subtle blue tint */}
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
```

- [ ] **Step 2: Verify in browser**

Scroll to Music. Expected: centered glass card with music emoji, heading, and short paragraph. Subtle blue tint on card background.

- [ ] **Step 3: Commit**

```bash
git add src/components/Music.tsx
git commit -m "feat: add Music personal section"
```

---

## Task 10: Languages

**Files:**
- Modify: `src/components/Languages.tsx`

- [ ] **Step 1: Implement Languages**

```tsx
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
```

- [ ] **Step 2: Verify in browser**

Scroll to Languages. Expected: 4-col grid on desktop, 2-col on mobile. Cards lift on hover with blue border tint.

- [ ] **Step 3: Commit**

```bash
git add src/components/Languages.tsx
git commit -m "feat: add Languages section with 4 language cards"
```

---

## Task 11: Contact + Footer

**Files:**
- Modify: `src/components/Contact.tsx`

- [ ] **Step 1: Implement Contact**

```tsx
export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Glow */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
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
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update contact details**

In `Contact.tsx`:
- Replace `nathaniel@avlokai.com` with Nathaniel's actual email once confirmed
- Replace `https://www.linkedin.com/in/nathaniel-francis` with his actual LinkedIn URL

- [ ] **Step 3: Verify full page in browser**

Scroll through entire page top to bottom. Check:
- Navbar smooth-scrolls to each section when links are clicked
- All 8 sections visible with no layout breaks
- Mobile (resize to 375px): all sections stack correctly, no horizontal overflow
- Photo loads in Hero
- Footer shows correct year

- [ ] **Step 4: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "feat: add Contact section and complete single-page portfolio"
```

---

## Task 12: Production Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: `dist/` folder created, no TypeScript errors, no Vite warnings about unresolved imports.

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173`. Verify same visual result as dev server.

- [ ] **Step 3: Final commit**

```bash
git add dist/ -f
git commit -m "feat: production build of Nathaniel Francis portfolio"
```

Or add `dist/` to `.gitignore` if deploying via CI:

```bash
echo "dist/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore dist output"
```
