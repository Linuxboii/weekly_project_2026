import { profile } from '../data.js';

export default function Footer() {
  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        <p className="font-mono text-xs">{profile.role} · {profile.location}</p>
      </div>
    </footer>
  );
}
