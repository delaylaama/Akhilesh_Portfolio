"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/content/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { useGame } from "@/components/providers/GameProvider";

const RARITY: Record<NonNullable<Project["rarity"]>, { label: string; color: string }> = {
  common: { label: "Common", color: "#9491bf" },
  rare: { label: "Rare", color: "#5ee6c9" },
  epic: { label: "Epic", color: "#9b7bff" },
  legendary: { label: "Legendary", color: "#ffcc33" },
};

const MIN_SLOTS = 15;

/**
 * Inventory grid. Arrow keys move the selection (roving tabindex), Enter opens the item.
 * Hover/focus previews the item in the side panel; empty slots pad the grid out like a real inventory.
 */
export function Inventory({ items }: { items: Project[] }) {
  const router = useRouter();
  const { sfx } = useGame();
  const [sel, setSel] = useState(0);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const slots = Math.max(MIN_SLOTS, Math.ceil(items.length / 5) * 5);
  const current = items[sel];

  const move = (i: number) => {
    if (i < 0 || i >= items.length || i === sel) return;
    sfx("move");
    setSel(i);
    refs.current[i]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    // Measure the live column count so arrow keys match whatever the responsive grid shows
    const list = e.currentTarget.closest("ul");
    const kids = list ? Array.from(list.children) as HTMLElement[] : [];
    const cols = Math.max(1, kids.filter((k) => k.offsetTop === kids[0]?.offsetTop).length);
    const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    if (map[e.key] !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      move(i + map[e.key]);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-24 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      {/* Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between font-pixel text-[10px] uppercase tracking-widest text-dim">
          <span>Bag — {items.length} / {slots}</span>
          <span className="hidden md:inline">← → ↑ ↓ select · Enter open</span>
        </div>
        <ul className="pixel-box grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-5" role="list">
          {Array.from({ length: slots }).map((_, i) => {
            const p = items[i];
            if (!p) {
              return (
                <li key={`empty-${i}`} aria-hidden="true" className="dither aspect-square opacity-60 ring-2 ring-line/70" />
              );
            }
            const r = RARITY[p.rarity ?? "common"];
            const active = i === sel;
            return (
              <li key={p.slug}>
                <Link
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  href={`/work/${p.slug}`}
                  tabIndex={active ? 0 : -1}
                  onKeyDown={(e) => onKey(e, i)}
                  onMouseEnter={() => {
                    if (i !== sel) sfx("move");
                    setSel(i);
                  }}
                  onFocus={() => setSel(i)}
                  onClick={() => sfx("select")}
                  className={`group relative block aspect-square overflow-hidden bg-panel-2 outline-none transition-transform duration-100 ${
                    active ? "z-10 scale-[1.03] ring-4 ring-gold" : "ring-2 ring-line hover:ring-dim"
                  }`}
                  aria-label={`${p.title} — ${p.category}, ${p.year}`}
                >
                  <MediaFrame media={p.thumbnail} aspect="1:1" bare sizes="(min-width:1024px) 220px, 45vw" />
                  {/* rarity gem */}
                  <span className="absolute left-2 top-2 h-3 w-3 rotate-45" style={{ background: r.color, boxShadow: "0 0 0 2px #07080f" }} />
                  <span className="absolute bottom-0 left-0 right-0 bg-void/85 px-2 py-1.5">
                    <span className="block truncate font-pixel text-[10px] uppercase text-ink">{p.title}</span>
                    <span className="block font-term text-sm leading-none text-dim">{p.year}</span>
                  </span>
                  {p.sample && (
                    <span className="absolute right-1.5 top-1.5 bg-pink px-1 font-pixel text-[8px] uppercase text-void">Sample</span>
                  )}
                  {active && <span className="blink absolute -left-0.5 top-1/2 -translate-y-1/2 font-pixel text-gold">▶</span>}
                </Link>
              </li>
            );
          })}
        </ul>
        {items.length === 0 && (
          <p className="mt-6 font-term text-xl text-dim">Inventory empty — add projects with <code>featured: true</code> in content/projects.ts.</p>
        )}
      </div>

      {/* Detail panel (desktop) */}
      <aside className="hidden lg:block" aria-live="polite">
        <div className="sticky top-[calc(var(--hud-h)+1.5rem)]">
          <AnimatePresence mode="wait" initial={false}>
            {current && (
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.14 }}
                className="pixel-box p-4"
              >
                <div className="crt">
                  <MediaFrame media={current.thumbnail} sizes="420px" bare />
                </div>
                <div className="mt-4 flex items-center gap-2 font-pixel text-[10px] uppercase tracking-wider">
                  <span className="h-2.5 w-2.5 rotate-45" style={{ background: RARITY[current.rarity ?? "common"].color }} />
                  <span style={{ color: RARITY[current.rarity ?? "common"].color }}>{RARITY[current.rarity ?? "common"].label}</span>
                  <span className="text-line">/</span>
                  <span className="text-dim">{current.category}</span>
                  <span className="ml-auto text-dim">{current.year}</span>
                </div>
                <h2 className="mt-3 font-serif text-4xl leading-none text-ink">{current.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-dim">{current.description}</p>
                {current.role && (
                  <p className="mt-4 font-term text-lg text-dim">
                    <span className="text-ink">Role:</span> {current.role.join(", ")}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sfx("select");
                    router.push(`/work/${current.slug}`);
                  }}
                  className="btn-pixel btn-pixel--gold mt-5 w-full justify-center text-xs"
                >
                  View project ▶
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}
