"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Experiment } from "@/content/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { useGame } from "@/components/providers/GameProvider";

// Each toy is loaded only when its cartridge is inserted
const loading = () => <p className="p-8 font-pixel text-xs uppercase text-dim">Loading<span className="blink">…</span></p>;
const TOYS: Record<string, React.ComponentType> = {
  "dither-lab": dynamic(() => import("./DitherLab").then((m) => m.DitherLab), { ssr: false, loading }),
  "pixel-studio": dynamic(() => import("./PixelStudio").then((m) => m.PixelStudio), { ssr: false, loading }),
  "kern-catch": dynamic(() => import("./KernCatch").then((m) => m.KernCatch), { ssr: false, loading }),
};

const COLORS = ["#ff5ea8", "#5ee6c9", "#ffcc33", "#9b7bff", "#3d7bff", "#ff8a3d"];

export function Playground({ items }: { items: Experiment[] }) {
  const { sfx } = useGame();
  const [slug, setSlug] = useState(items[0]?.slug);

  // Deep-link support: /playground#kern-catch
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (items.some((i) => i.slug === h)) setSlug(h);
  }, [items]);

  const current = items.find((i) => i.slug === slug);
  const Toy = current?.kind === "built-in" ? TOYS[current.slug] : undefined;

  const insert = (s: string) => {
    if (s === slug) return;
    sfx("select");
    setSlug(s);
    history.replaceState(null, "", `#${s}`);
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-24 md:px-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Cartridge rack */}
      <nav aria-label="Experiments">
        <p className="mb-3 font-pixel text-[10px] uppercase tracking-widest text-dim">Cartridges</p>
        <ul className="flex gap-3 overflow-x-auto pb-2 xl:flex-col xl:overflow-visible">
          {items.map((it, i) => (
            <li key={it.slug} className="shrink-0">
              <button
                type="button"
                aria-pressed={it.slug === slug}
                onClick={() => insert(it.slug)}
                onMouseEnter={() => sfx("move")}
                className={`group flex w-56 items-stretch text-left transition-transform xl:w-full ${it.slug === slug ? "translate-x-0 xl:translate-x-2" : "hover:xl:translate-x-1"}`}
              >
                <span className="w-3 shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className={`flex-1 px-3 py-3 ${it.slug === slug ? "bg-panel-2 ring-2 ring-gold" : "bg-panel"}`}>
                  <span className="block font-pixel text-[11px] uppercase text-ink">{it.title}</span>
                  <span className="mt-1 block font-term text-base leading-none text-dim">{it.tags?.join(" · ") ?? it.kind}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 hidden font-term text-lg leading-snug text-line xl:block">
          Psst. Some things around the site respond to old cheat codes.
        </p>
      </nav>

      {/* Console window */}
      {current && (
        <section aria-labelledby="toy-title" className="pixel-box">
          <div className="flex items-center gap-3 bg-panel-2 px-4 py-2">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 bg-pink" />
              <span className="h-3 w-3 bg-gold" />
              <span className="h-3 w-3 bg-mint" />
            </span>
            <h2 id="toy-title" className="font-pixel text-[11px] uppercase tracking-wider text-ink">
              {current.title}
            </h2>
            <span className="ml-auto font-term text-base text-dim">{current.slug}.exe</span>
          </div>
          <div className="p-4 md:p-6">
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-dim">{current.description}</p>
            {Toy ? (
              <Toy key={current.slug} />
            ) : current.kind === "media" && current.media ? (
              <MediaFrame media={current.media} />
            ) : current.kind === "link" && current.href ? (
              <a href={current.href} target="_blank" rel="noreferrer" className="btn-pixel btn-pixel--gold text-xs">
                Open experiment ↗
              </a>
            ) : (
              <p className="font-term text-xl text-dim">Nothing loaded in this slot yet.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
