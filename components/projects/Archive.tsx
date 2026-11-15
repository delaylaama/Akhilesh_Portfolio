"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Project } from "@/content/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { useGame } from "@/components/providers/GameProvider";

/**
 * The no-game shortcut: every project in one scannable list.
 * Category filters, list/grid views, and a thumbnail that follows the cursor on hover.
 */
export function Archive({ items }: { items: Project[] }) {
  const { sfx, reducedMotion } = useGame();
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((p) => p.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [view, setView] = useState<"list" | "grid">("list");
  const [hover, setHover] = useState<Project | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const shown = cat === "All" ? items : items.filter((p) => p.category === cat);

  const onMove = (e: React.MouseEvent) => {
    const el = preview.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 90}px)`;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-line pb-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => {
                sfx("move");
                setCat(c);
              }}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase tracking-wider ${cat === c ? "bg-gold text-void" : "bg-panel text-dim hover:text-ink"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div role="group" aria-label="View" className="flex gap-1.5">
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase ${view === v ? "bg-mint text-void" : "bg-panel text-dim hover:text-ink"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <ol className="relative" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {shown.map((p, i) => (
            <li key={p.slug} className="border-b-2 border-line/60">
              <Link
                href={`/work/${p.slug}`}
                onMouseEnter={() => setHover(p)}
                onFocus={() => setHover(null)}
                onClick={() => sfx("select")}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-5 md:grid-cols-[3.5rem_minmax(0,1fr)_14rem_5rem_2rem] md:py-6"
              >
                <span className="font-term text-xl text-line group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-3xl leading-none text-ink transition-transform group-hover:translate-x-2 md:text-5xl">
                  {p.title}
                  {p.sample && <span className="ml-3 align-middle font-pixel text-[9px] uppercase text-pink">Sample</span>}
                </span>
                <span className="col-start-2 font-term text-lg text-dim md:col-start-auto">{p.category}</span>
                <span className="row-start-1 col-start-3 font-term text-lg text-dim md:row-start-auto md:col-start-auto">{p.year}</span>
                <span className="hidden font-pixel text-gold opacity-0 transition-opacity group-hover:opacity-100 md:block">→</span>
              </Link>
            </li>
          ))}
          {/* Cursor-following preview (mouse only) */}
          {!reducedMotion && (
            <div ref={preview} className="pointer-events-none fixed left-0 top-0 z-40 hidden w-64 md:block" aria-hidden="true">
              {hover && (
                <div className="pixel-box pixel-box--gold p-1.5">
                  <MediaFrame media={hover.thumbnail} aspect="4:3" bare sizes="256px" />
                </div>
              )}
            </div>
          )}
        </ol>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} onClick={() => sfx("select")} className="group block">
                <div className="pixel-box p-1.5 transition-transform group-hover:-translate-y-1">
                  <MediaFrame media={p.thumbnail} aspect="4:3" bare sizes="(min-width:1024px) 33vw, 50vw" />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-3xl leading-none text-ink group-hover:text-gold">{p.title}</h2>
                  <span className="font-term text-lg text-dim">{p.year}</span>
                </div>
                <p className="font-term text-lg text-dim">{p.category}</p>
                <p className="mt-2 text-sm leading-relaxed text-dim">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {shown.length === 0 && <p className="mt-10 font-term text-xl text-dim">No projects in this category yet.</p>}
    </div>
  );
}
