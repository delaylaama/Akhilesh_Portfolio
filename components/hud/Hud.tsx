"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/content/site";
import { useGame } from "@/components/providers/GameProvider";

function isTyping(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

export function Hud() {
  const pathname = usePathname();
  const router = useRouter();
  const { sound, toggleSound, sfx, secret } = useGame();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Global hotkeys: 1–6 jump between sections, M toggles sound.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const item = nav.find((n) => n.hotkey === e.key);
      if (item) {
        sfx("select");
        router.push(item.href);
      } else if (e.key.toLowerCase() === "m") {
        toggleSound();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, sfx, toggleSound]);

  useEffect(() => setOpen(false), [pathname]);

  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (first) return setFirst(false);
    setToast(secret ? "CHEAT ON — PALETTE SWAP" : "CHEAT OFF");
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-[var(--hud-h)] border-b-4 border-void bg-night/85 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
          <Link href="/" className="whitespace-nowrap font-pixel text-xs tracking-widest text-ink hover:text-gold sm:text-sm" aria-label={`${site.name} — home`}>
            <span className="text-gold">■</span> {site.handle}
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => (
                <li key={n.key}>
                  <Link
                    href={n.href}
                    onMouseEnter={() => sfx("move")}
                    aria-current={active(n.href) ? "page" : undefined}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 font-pixel text-[11px] uppercase tracking-wider transition-colors ${
                      active(n.href) ? "bg-gold text-void" : "text-dim hover:bg-panel-2 hover:text-ink"
                    }`}
                  >
                    <kbd className={`font-term text-sm leading-none ${active(n.href) ? "text-void/60" : "text-line group-hover:text-gold"}`}>{n.hotkey}</kbd>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/projects"
            className="btn-pixel btn-pixel--gold ml-auto whitespace-nowrap !px-2.5 !py-2 text-[9px] sm:!px-3 sm:text-[10px] lg:ml-2"
            title="Skip the game — see every project"
          >
            All projects
          </Link>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="flex h-9 items-center gap-1.5 px-1 font-pixel sm:px-2 text-[10px] uppercase text-dim hover:text-ink"
            title="Toggle sound (M)"
          >
            <SpeakerIcon on={sound} />
            <span className="hidden sm:inline">{sound ? "Sound on" : "Sound off"}</span>
          </button>

          <button
            type="button"
            className="btn-pixel !px-3 !py-2 text-[10px] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              sfx(open ? "back" : "select");
              setOpen((o) => !o);
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.25, ease: [0.7, 0, 0.3, 1] }}
            className="dither fixed inset-x-0 top-[var(--hud-h)] z-40 border-b-4 border-void p-4 lg:hidden"
          >
            <div className="pixel-box mx-auto max-w-md p-3">
              <p className="mb-2 px-3 font-term text-lg text-dim">SELECT DESTINATION</p>
              <ul>
                {nav.map((n) => (
                  <li key={n.key}>
                    <Link
                      href={n.href}
                      data-active={active(n.href)}
                      className="caret flex items-center px-3 py-3 font-pixel text-base uppercase text-ink hover:text-gold"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="pixel-box pixel-box--gold fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-5 py-3 font-pixel text-xs text-gold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
      <rect x="0" y="3" width="2" height="3" />
      <rect x="2" y="2" width="1" height="5" />
      <rect x="3" y="1" width="1" height="7" />
      {on ? (
        <>
          <rect x="5" y="3" width="1" height="3" />
          <rect x="7" y="1" width="1" height="7" />
          <rect x="6" y="2" width="1" height="1" />
          <rect x="6" y="6" width="1" height="1" />
        </>
      ) : (
        <>
          <rect x="5" y="3" width="1" height="1" />
          <rect x="6" y="4" width="1" height="1" />
          <rect x="7" y="5" width="1" height="1" />
          <rect x="7" y="3" width="1" height="1" />
          <rect x="5" y="5" width="1" height="1" />
        </>
      )}
    </svg>
  );
}
