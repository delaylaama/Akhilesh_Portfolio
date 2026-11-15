"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BootScreen } from "@/components/boot/BootScreen";
import { hotspots, type HotspotKey } from "@/components/room/hotspots";
import { useGame } from "@/components/providers/GameProvider";
import { site } from "@/content/site";

const RoomCanvas = dynamic(() => import("@/components/room/RoomCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="font-pixel text-xs uppercase tracking-widest text-dim">
        Loading room<span className="blink">…</span>
      </p>
    </div>
  ),
});

const RES = [
  { label: "240p", value: 240 },
  { label: "360p", value: 360 },
  { label: "480p", value: 480 },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function readSession(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeSession(key: string, v: string) {
  try {
    window.sessionStorage.setItem(key, v);
  } catch {
    /* ignore */
  }
}

export function HomeExperience() {
  const router = useRouter();
  const { sfx, reducedMotion } = useGame();
  const [boot, setBoot] = useState<"pending" | "show" | "done">("pending");
  const [webgl, setWebgl] = useState(true);
  const [compact, setCompact] = useState(false);
  const [touch, setTouch] = useState(false);
  const [hover, setHover] = useState<HotspotKey | null>(null);
  const [focus, setFocus] = useState<HotspotKey | null>(null);
  const [entering, setEntering] = useState<HotspotKey | null>(null);
  const [day, setDay] = useState(false);
  const [res, setRes] = useState(360);
  const menuRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    setWebgl(hasWebGL());
    const mqCompact = window.matchMedia("(max-width: 767px)");
    const mqTouch = window.matchMedia("(hover: none)");
    const sync = () => {
      setCompact(mqCompact.matches);
      setTouch(mqTouch.matches);
    };
    sync();
    mqCompact.addEventListener("change", sync);
    mqTouch.addEventListener("change", sync);
    // The intro plays once per session, and never for reduced-motion visitors
    const seen = readSession("booted") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBoot(seen || reduced ? "done" : "show");
    return () => {
      mqCompact.removeEventListener("change", sync);
      mqTouch.removeEventListener("change", sync);
    };
  }, []);

  const enter = useCallback(
    (key: HotspotKey) => {
      const hs = hotspots.find((h) => h.key === key);
      if (!hs || entering) return;
      sfx("select");
      setEntering(key);
      setHover(key);
      setTimeout(() => router.push(hs.href), reducedMotion ? 0 : 650);
    },
    [entering, reducedMotion, router, sfx],
  );

  // Touch: first tap highlights an object, second tap enters it.
  const onSelect3D = useCallback(
    (key: HotspotKey) => {
      if (touch && hover !== key) {
        sfx("move");
        setHover(key);
        return;
      }
      enter(key);
    },
    [enter, hover, sfx, touch],
  );

  const onHover3D = useCallback(
    (key: HotspotKey | null) => {
      if (touch || entering) return;
      setHover((prev) => {
        if (key && key !== prev) sfx("move");
        return key;
      });
    },
    [entering, sfx, touch],
  );

  // Arrow keys cycle objects; Enter opens the focused one (handled by the focused link itself).
  useEffect(() => {
    if (boot !== "done") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      const cur = hotspots.findIndex((h) => h.key === (focus ?? hover));
      const next = hotspots[(cur + dir + hotspots.length) % hotspots.length];
      menuRefs.current[next.key]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [boot, focus, hover]);

  const active = hover ?? focus;

  return (
    <>
      {boot === "pending" && <div className="fixed inset-0 z-[70] bg-void" aria-hidden="true" />}
      <AnimatePresence>
        {boot === "show" && (
          <BootScreen
            onDone={() => {
              writeSession("booted", "1");
              setBoot("done");
            }}
          />
        )}
      </AnimatePresence>

      <section className="relative flex min-h-[100svh] flex-col bg-void pt-[var(--hud-h)] md:block md:h-[100svh]" aria-label="Studio">
        {/* Intro copy */}
        <div className="pointer-events-none relative z-10 px-5 pb-2 pt-6 md:absolute md:left-0 md:top-[var(--hud-h)] md:max-w-[34rem] md:px-8 md:pt-10">
          <p className="font-pixel text-[10px] uppercase tracking-[0.25em] text-mint">
            <span className="blink">●</span> Player 1 — {site.status}
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-ink md:text-7xl">
            {site.name.charAt(0) + site.name.slice(1).toLowerCase()}
            <span className="block italic text-gold">{site.role}</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-dim md:text-base">{site.tagline}</p>
        </div>

        {/* 3D room */}
        <div className="relative h-[58svh] w-full md:absolute md:inset-0 md:h-auto">
          {webgl ? (
            boot !== "pending" && (
              <RoomCanvas
                active={active}
                focus={focus}
                entering={entering}
                resolution={compact ? Math.min(res, 300) : res}
                reducedMotion={reducedMotion}
                compact={compact}
                day={day}
                onHover={onHover3D}
                onSelect={onSelect3D}
                onToggleDay={() => {
                  sfx("coin");
                  setDay((d) => !d);
                }}
              />
            )
          ) : (
            <div className="dither absolute inset-0 flex items-center justify-center p-8 text-center">
              <p className="font-term text-xl text-dim">3D isn&apos;t available in this browser — use the menu to explore.</p>
            </div>
          )}
          {/* subtle CRT vignette over the scene */}
          <div className="crt pointer-events-none absolute inset-0" />
          {touch && (
            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-term text-lg text-dim md:hidden">
              {hover ? `Tap the ${hotspots.find((h) => h.key === hover)?.object.toLowerCase()} again to enter` : "Tap an object to look closer"}
            </p>
          )}
        </div>

        {/* Interaction menu — the always-available, accessible way in */}
        <nav
          aria-label="Explore the studio"
          className="relative z-10 px-4 pb-8 pt-4 md:absolute md:bottom-8 md:right-8 md:w-[22rem] md:p-0"
        >
          <div className="pixel-box p-3 md:bg-panel/90 md:backdrop-blur">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="font-pixel text-[10px] uppercase tracking-widest text-dim">Interact</p>
              <p className="font-term text-base text-line">{hotspots.length} objects</p>
            </div>
            <ul>
              {hotspots.map((h, i) => (
                <li key={h.key}>
                  <Link
                    ref={(el) => {
                      menuRefs.current[h.key] = el;
                    }}
                    href={h.href}
                    data-active={active === h.key}
                    onMouseEnter={() => {
                      sfx("move");
                      setFocus(h.key);
                    }}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={() => {
                      sfx("move");
                      setFocus(h.key);
                    }}
                    onBlur={() => setFocus(null)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      enter(h.key);
                    }}
                    className={`caret flex items-baseline gap-3 px-2 py-2.5 transition-colors ${active === h.key ? "bg-panel-2" : ""}`}
                  >
                    <span className="font-pixel text-xs uppercase tracking-wider text-ink">{h.label}</span>
                    <span className="truncate font-term text-lg leading-none text-dim">{h.object}</span>
                    <kbd className="ml-auto font-term text-base text-line">{i + 2}</kbd>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Controls + render settings (desktop) */}
        <div className="absolute bottom-8 left-8 z-10 hidden items-end gap-6 md:flex">
          <dl className="font-term text-lg leading-tight text-dim">
            <div className="flex gap-2"><dt className="text-ink">Mouse</dt><dd>look · click objects</dd></div>
            <div className="flex gap-2"><dt className="text-ink">↑ ↓</dt><dd>choose · Enter open</dd></div>
            <div className="flex gap-2"><dt className="text-ink">1–6</dt><dd>jump to a section</dd></div>
            <div className="flex gap-2"><dt className="text-ink">?</dt><dd>try the window</dd></div>
          </dl>
          <fieldset className="flex items-center gap-1">
            <legend className="sr-only">Render resolution</legend>
            {RES.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={res === r.value}
                onClick={() => {
                  sfx("move");
                  setRes(r.value);
                }}
                className={`px-2 py-1 font-pixel text-[10px] ${res === r.value ? "bg-mint text-void" : "text-dim hover:text-ink"}`}
              >
                {r.label}
              </button>
            ))}
          </fieldset>
        </div>

        <AnimatePresence>
          {entering && !reducedMotion && (
            <motion.div
              className="pointer-events-none fixed inset-0 z-[65] bg-void"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3, ease: "linear" }}
            />
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
