import { Mail, Phone, MapPin, Github, Linkedin, Globe } from 'lucide-react';
import { PageShell } from '../components/Section.jsx';
import { profile } from '../data.js';

function handleSubmit(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const name = f.name_field.value.trim();
  const email = f.email.value.trim();
  const subject = f.subject.value.trim() || `Inbound from ${name || 'portfolio'}`;
  const message = f.message.value.trim();
  const body = `${message}\n\n- ${name}\n${email}`;
  const to = profile.emailPrimary;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
}

export default function Contact() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Let's talk."
      lede="Tell me what's slowing your team down. Manual ops, fragile spreadsheets, an inbox you can't keep up with. I'll tell you whether it's worth automating."
    >
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-8">
          <ul className="space-y-5 text-[15px]">
            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-1 text-muted" />
              <div>
                <a href={`mailto:${profile.emailPrimary}`} className="font-medium underline-offset-4 hover:underline">
                  {profile.emailPrimary}
                </a>
                <p className="text-sm text-muted">
                  Or <a href={`mailto:${profile.emailFallback}`} className="underline-offset-4 hover:underline">{profile.emailFallback}</a>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-1 text-muted" />
              <a href={`tel:${profile.phone.replace(/\s+/g, '')}`}>{profile.phone}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-1 text-muted" />
              <span>{profile.location}</span>
            </li>
          </ul>

          <div className="flex gap-3">
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm hover:border-ink"
            >
              <Linkedin size={14} /> LinkedIn
            </a>
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm hover:border-ink"
            >
              <Github size={14} /> GitHub
            </a>
            <a
              href={profile.socials.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm hover:border-ink"
            >
              <Globe size={14} /> AvlokAI
            </a>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="name_field"
              placeholder="Your name"
              required
              className="w-full rounded-md border border-line bg-canvas px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Your email"
              required
              className="w-full rounded-md border border-line bg-canvas px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </div>
          <input
            name="subject"
            placeholder="Subject"
            className="w-full rounded-md border border-line bg-canvas px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <textarea
            name="message"
            rows={7}
            placeholder="What are you trying to automate, ship, or secure?"
            required
            className="w-full rounded-md border border-line bg-canvas px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-accent"
          >
            Send message
          </button>
        </form>
      </div>
    </PageShell>
  );
}
