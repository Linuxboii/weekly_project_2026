export function PageShell({ eyebrow, title, lede, children }) {
  return (
    <div className="page-enter mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            {title}
          </h1>
        )}
        {lede && <p className="mt-6 max-w-prose text-lg text-muted">{lede}</p>}
      </div>
      <div className="mt-12 sm:mt-16">{children}</div>
    </div>
  );
}

export function SectionTitle({ children, kicker }) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-6 border-b border-line pb-3">
      <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{children}</h2>
      {kicker && <span className="font-mono text-xs uppercase tracking-widest text-muted">{kicker}</span>}
    </div>
  );
}
