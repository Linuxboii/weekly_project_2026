# Nathaniel Francis Portfolio — Design Spec

**Date:** 2026-05-26  
**Status:** Approved

## Overview

Single-page portfolio for Nathaniel Francis, CRO at AvlokAI. Professional-first tone. Mirrors the design language of sushanth.avlokai.com but with electric blue accent and Nathaniel's identity.

## Stack

- Vite + React + TypeScript + Tailwind CSS
- No SSR needed — static single-page portfolio
- Deployed from `nathaniel-portfolio/` directory

## Design System

| Token | Value |
|-------|-------|
| Background | `#000000` |
| Foreground | `#fafafa` |
| Accent | `#3b82f6` (electric blue) |
| Accent dim | `#2563eb` |
| Muted | `#71717a` |
| Border | `#27272a` |
| Card | `#18181b` |
| Card hover | `#1f1f23` |

- Font: Inter (Google Fonts)
- Glass cards: `rgba(24,24,27,0.8)` + `backdrop-filter: blur(12px)` + border
- Animated grid background on hero (same pattern as avlokai.com)
- Blue glow effects replacing emerald

## Sections

### 1. Navbar
- Left: "Nathaniel Francis" wordmark
- Right: smooth-scroll links — About, Role, Skills, Music, Languages, Contact
- Sticky, glass blur background on scroll

### 2. Hero
- Layout: text left, photo right (same split as Sushanth's)
- Badge: "CRO @ AvlokAI" with blue pulse dot
- H1: "Nathaniel Francis" + subtitle "Chief Revenue Officer"
- Two CTAs: LinkedIn button (primary), scroll-to-contact (secondary)
- Photo: `nathan.jpg` in circular crop with blue glow ring
- Animated grid background, blue radial glow behind photo
- Entrance animation: text slides in from left, photo from right

### 3. About
- Two-col on desktop, stacked on mobile
- Short bio: 2nd year BSc Cognitive Systems & CS at Loyola Academy, Hyderabad. Already leading revenue at AvlokAI. Early career, high trajectory.
- Subtle stats row: "2nd Year", "4 Languages", "CRO"

### 4. Role at AvlokAI
- Single featured glass card
- AvlokAI logo/name, role title, 3-4 bullet responsibilities
- Link to avlokai.com
- Blue left-border accent on card

### 5. Skills
- Two groups side by side: Frontend + Sales
- Frontend: TypeScript, HTML, CSS, Tailwind CSS — chip tags
- Sales: Lead Generation, Client Relations, Pipeline Management, Strategic Partnerships — chip tags
- Group headers in blue mono font

### 6. Music
- Minimal personal section — keeps it human
- Music note icon, short quote about passion for music
- Subtle, doesn't overshadow professional content

### 7. Languages
- 4 language badge cards in a row: Hindi, English, Telugu, Tamil
- Each card: language name + proficiency label ("Native" / "Fluent")
- Blue accent border on hover

### 8. Contact
- Clean close section
- Email link, LinkedIn button
- Tagline: "Let's build something together"

## File Structure

```
nathaniel-portfolio/
  nathan.jpg              (existing)
  index.html
  package.json
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  postcss.config.js
  src/
    App.tsx
    index.css
    components/
      Navbar.tsx
      Hero.tsx
      About.tsx
      RoleAtAvlokai.tsx
      Skills.tsx
      Music.tsx
      Languages.tsx
      Contact.tsx
```

## Constraints

- No external component libraries — raw Tailwind only
- No backend, no forms that need handling — contact section uses mailto/href links
- Image `nathan.jpg` already exists in root, reference as `/nathan.jpg` or `../nathan.jpg` from public
- Mobile responsive: all sections stack on small screens
- No page routing — single scroll page
