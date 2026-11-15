import Link from "next/link";

/** Header for "world" pages: breadcrumb back to the studio, pixel eyebrow, serif title. */
export function PageHeader({ eyebrow, title, lede, back = { href: "/", label: "Studio" }, children }: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-8 pt-[calc(var(--hud-h)+2rem)] md:px-8 md:pb-12 md:pt-[calc(var(--hud-h)+3rem)]">
      <Link href={back.href} className="font-pixel text-[10px] uppercase tracking-widest text-dim hover:text-gold">
        ◀ {back.label}
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-pixel text-[11px] uppercase tracking-[0.25em] text-mint">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-ink md:text-7xl">{title}</h1>
          {lede && <p className="mt-4 max-w-xl text-base leading-relaxed text-dim">{lede}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
