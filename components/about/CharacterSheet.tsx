"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { PixelAvatar } from "./PixelAvatar";
import { useGame } from "@/components/providers/GameProvider";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "stats", label: "Stats" },
  { id: "gear", label: "Equipment" },
  { id: "log", label: "Quest log" },
  { id: "code", label: "Philosophy" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/**
 * The designer as a playable character: a portrait card on the left,
 * a tabbed status screen on the right (← → or Q / E switch tabs).
 */
export function CharacterSheet() {
  const { sfx } = useGame();
  const [tab, setTab] = useState<TabId>("profile");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = site.about;

  const go = (i: number) => {
    const n = (i + TABS.length) % TABS.length;
    sfx("move");
    setTab(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "e") go(i + 1);
    else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "q") go(i - 1);
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-24 md:px-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      {/* Character card */}
      <aside className="pixel-box self-start p-5 lg:sticky lg:top-[calc(var(--hud-h)+1.5rem)]">
        <div className="dither relative mx-auto w-full max-w-[16rem] p-6">
          <PixelAvatar />
          <span className="absolute left-2 top-2 font-pixel text-[9px] uppercase text-mint">P1</span>
        </div>
        <h2 className="mt-5 font-pixel text-lg uppercase tracking-wider text-ink">{site.name}</h2>
        <p className="font-term text-xl text-gold">{site.role}</p>
        <dl className="mt-4 space-y-1.5 border-t-2 border-line pt-4">
          {a.traits.map((t) => (
            <div key={t.label} className="flex justify-between gap-4 font-term text-lg">
              <dt className="text-dim">{t.label}</dt>
              <dd className="text-right text-ink">{t.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 font-term text-lg">
            <dt className="text-dim">Location</dt>
            <dd className="text-right text-ink">{site.location}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-2 font-pixel text-[10px] uppercase text-mint">
          <span className="blink">●</span> {site.status}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/contact" className="btn-pixel btn-pixel--gold text-[10px]">Send message</Link>
          {site.contact.resume && (
            <a href={site.contact.resume} className="btn-pixel text-[10px]" download>
              Résumé
            </a>
          )}
        </div>
      </aside>

      {/* Status screen */}
      <section>
        <div role="tablist" aria-label="Character sheet" className="flex flex-wrap gap-1 border-b-4 border-void" onKeyDown={onKey}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => {
                sfx("move");
                setTab(t.id);
              }}
              className={`px-4 py-2.5 font-pixel text-[10px] uppercase tracking-wider ${tab === t.id ? "bg-gold text-void" : "bg-panel text-dim hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto hidden self-center font-term text-lg text-line md:block">Q / E or ← → to switch</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="pt-8"
          >
            {tab === "profile" && (
              <div className="max-w-3xl">
                <p className="font-serif text-3xl leading-snug text-ink md:text-4xl">{a.intro}</p>
                <div className="mt-8 space-y-4 text-base leading-relaxed text-dim md:text-lg">
                  {a.background.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {tab === "stats" && (
              <div className="grid gap-10 md:grid-cols-2">
                <ul className="space-y-4">
                  {a.stats.map((s) => (
                    <li key={s.label}>
                      <div className="mb-1.5 flex justify-between font-pixel text-[10px] uppercase tracking-wider">
                        <span className="text-ink">{s.label}</span>
                        <span className="text-gold">{s.value}/10</span>
                      </div>
                      <div className="flex gap-1" aria-hidden="true">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className={`h-4 flex-1 ${i < s.value ? "bg-mint" : "bg-panel-2"}`}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.03 }}
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                <div>
                  <h3 className="font-pixel text-[10px] uppercase tracking-widest text-dim">Abilities</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {a.skills.map((s, i) => (
                      <li key={s + i} className="bg-panel-2 px-3 py-2 font-term text-lg text-ink">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "gear" && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {a.tools.map((t, i) => (
                  <li key={t + i} className="pixel-box flex aspect-[4/3] flex-col items-center justify-center gap-2 p-3 text-center">
                    <span className="flex h-10 w-10 items-center justify-center bg-panel-2 font-pixel text-sm text-gold">{t.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?"}</span>
                    <span className="font-term text-lg leading-none text-ink">{t}</span>
                  </li>
                ))}
              </ul>
            )}

            {tab === "log" && (
              <ol className="relative max-w-3xl border-l-4 border-line pl-6">
                {a.experience.map((x, i) => (
                  <li key={i} className="relative pb-8 last:pb-0">
                    <span className={`absolute -left-[2.05rem] top-1 h-4 w-4 ${i === 0 ? "bg-gold" : "bg-line"}`} />
                    <p className="font-term text-lg text-dim">{x.period}</p>
                    <h3 className="font-serif text-3xl text-ink">
                      {x.role} <span className="text-dim">·</span> <span className="italic">{x.org}</span>
                    </h3>
                    {x.note && <p className="mt-1 text-dim">{x.note}</p>}
                    {i === 0 && <p className="mt-2 font-pixel text-[9px] uppercase text-gold">Current quest</p>}
                  </li>
                ))}
              </ol>
            )}

            {tab === "code" && (
              <ol className="grid gap-4 md:grid-cols-3">
                {a.philosophy.map((p, i) => (
                  <li key={i} className="pixel-box p-5">
                    <span className="font-pixel text-2xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 font-serif text-3xl leading-tight text-ink">{p.title}</h3>
                    <p className="mt-2 text-dim">{p.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
