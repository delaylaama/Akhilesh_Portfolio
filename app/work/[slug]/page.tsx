import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { BlockView } from "@/components/project/Blocks";
import { MediaFrame } from "@/components/ui/MediaFrame";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.description };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(i + 1) % projects.length];
  const meta = [
    { k: "Client", v: p.client },
    { k: "Role", v: p.role?.join(", ") },
    { k: "Tools", v: p.tools?.join(", ") },
    { k: "Team", v: p.team?.join(", ") },
    { k: "Duration", v: p.duration },
  ].filter((m) => m.v);

  return (
    <article className="min-h-screen bg-paper pt-[var(--hud-h)] text-print">
      {/* Window-style title bar: the one retro detail on an otherwise editorial page */}
      <div className="sticky top-[var(--hud-h)] z-30 border-b-2 border-print bg-paper-2">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-2 md:px-8">
          <Link href="/work" className="font-pixel text-[10px] uppercase tracking-widest text-print hover:underline">
            ◀ Inventory
          </Link>
          <span className="truncate font-term text-lg text-print-dim">C:\WORK\{p.slug.toUpperCase().replace(/-/g, "_")}.CASE</span>
          <span className="ml-auto hidden gap-1 sm:flex" aria-hidden="true">
            <span className="h-3 w-3 border-2 border-print" />
            <span className="h-3 w-3 border-2 border-print bg-print" />
          </span>
        </div>
      </div>

      <header className="mx-auto max-w-[1400px] px-5 pb-10 pt-12 md:px-8 md:pb-14 md:pt-16">
        {p.sample && (
          <p className="mb-6 inline-block bg-pink px-2 py-1 font-pixel text-[10px] uppercase text-void">
            Sample entry — replace in content/projects.ts
          </p>
        )}
        <p className="font-pixel text-[11px] uppercase tracking-[0.2em] text-print-dim">
          {p.category} · {p.year}
        </p>
        <h1 className="mt-4 max-w-5xl font-serif text-6xl leading-[0.92] md:text-8xl">{p.title}</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <p className="max-w-2xl text-xl leading-relaxed text-print/85">{p.description}</p>
          {meta.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t-2 border-print pt-4">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="font-pixel text-[9px] uppercase tracking-widest text-print-dim">{m.k}</dt>
                  <dd className="mt-1 text-sm">{m.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {p.link?.href && (
          <a href={p.link.href} target="_blank" rel="noreferrer" className="mt-8 inline-block border-2 border-print px-4 py-2 font-pixel text-[10px] uppercase tracking-wider hover:bg-print hover:text-paper">
            {p.link.label} ↗
          </a>
        )}
      </header>

      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <MediaFrame media={p.cover ?? p.thumbnail} tone="paper" priority sizes="100vw" />
      </div>

      <div className="space-y-24 py-24 md:space-y-32 md:py-32">
        {p.blocks.map((b, idx) => (
          <BlockView key={idx} block={b} />
        ))}
      </div>

      {next && next.slug !== p.slug && (
        <Link href={`/work/${next.slug}`} className="group block border-t-2 border-print bg-print text-paper">
          <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-5 py-14 md:px-8 md:py-20">
            <div>
              <p className="font-pixel text-[10px] uppercase tracking-[0.25em] text-paper/60">Next item ▶</p>
              <p className="mt-3 font-serif text-5xl leading-none transition-colors group-hover:text-gold md:text-7xl">{next.title}</p>
              <p className="mt-3 font-term text-xl text-paper/60">
                {next.category} · {next.year}
              </p>
            </div>
            <span className="font-pixel text-3xl text-gold transition-transform group-hover:translate-x-2">→</span>
          </div>
        </Link>
      )}
    </article>
  );
}
