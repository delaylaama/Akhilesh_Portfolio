"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { textToPixels } from "@/lib/pixelFont";
import { site } from "@/content/site";
import { useGame } from "@/components/providers/GameProvider";

const LINES = [
  "SYSTEM CHECK ......... OK",
  "MEMORY CARD (SLOT 1) . OK",
  `LOADING ${site.handle}.SYS`,
  "PORTFOLIO DATA FOUND",
];

/**
 * Opening sequence: a short system check, a pixel logo that assembles block by block, then PRESS START.
 * Shown once per browser session, skippable at any moment (any key, click, or the skip link).
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const { sound, toggleSound, sfx } = useGame();
  const [stage, setStage] = useState<"check" | "logo" | "ready">("check");
  const [lineCount, setLineCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const startRef = useRef<HTMLButtonElement>(null);
  const logo = useMemo(() => textToPixels(site.handle), []);

  // Stage timing — the whole intro is ~2 seconds
  useEffect(() => {
    if (stage !== "check") return;
    if (lineCount < LINES.length) {
      const t = setTimeout(() => setLineCount((n) => n + 1), 170);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setStage("logo");
      sfx("boot");
    }, 200);
    return () => clearTimeout(t);
  }, [stage, lineCount, sfx]);

  useEffect(() => {
    if (stage !== "logo") return;
    const t = setTimeout(() => setStage("ready"), 900);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage === "ready") startRef.current?.focus();
  }, [stage]);

  const finish = () => {
    if (leaving) return;
    sfx("select");
    setLeaving(true);
    setTimeout(onDone, 420);
  };

  // Any key skips ahead (except Tab, so keyboard users can reach the buttons)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key.toLowerCase() === "m") return;
      if (stage !== "ready") {
        setLineCount(LINES.length);
        setStage("ready");
        return;
      }
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // px per logo pixel: 12 on desktop, shrinks to fit narrow screens
  const [cell, setCell] = useState(12);
  useEffect(() => {
    const fit = () => setCell(Math.max(4, Math.min(12, Math.floor((window.innerWidth - 48) / Math.max(1, logo.width)))));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [logo.width]);
  const tiles = 12; // dissolve grid

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-void"
      role="dialog"
      aria-modal="true"
      aria-label="Intro"
      onClick={() => stage !== "ready" && (setLineCount(LINES.length), setStage("ready"))}
    >
      {/* Pixel dissolve on exit */}
      {leaving && (
        <div className="pointer-events-none absolute inset-0 z-10 grid" style={{ gridTemplateColumns: `repeat(${tiles}, 1fr)`, gridTemplateRows: `repeat(${tiles}, 1fr)` }}>
          {Array.from({ length: tiles * tiles }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-void"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.01, delay: ((i * 7919) % 97) / 97 * 0.38 }}
            />
          ))}
        </div>
      )}

      <div className="crt pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className={`relative flex w-full max-w-3xl flex-col items-center px-6 ${leaving ? "opacity-0 transition-opacity duration-200" : ""}`}>
        {stage === "check" && (
          <pre className="w-full max-w-md font-term text-xl leading-tight text-mint" aria-live="polite">
            {LINES.slice(0, lineCount).join("\n")}
            <span className="blink">_</span>
          </pre>
        )}

        {stage !== "check" && (
          <>
            <div
              className="relative mx-auto"
              style={{ width: logo.width * cell, height: logo.height * cell }}
              role="img"
              aria-label={site.handle}
            >
              {logo.pixels.map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute bg-gold"
                  style={{ left: p.x * cell, top: p.y * cell, width: cell - 1, height: cell - 1, boxShadow: `inset -${Math.ceil(cell / 4)}px -${Math.ceil(cell / 4)}px 0 rgba(0,0,0,.25)` }}
                  initial={{ y: -260 - ((i * 53) % 140), opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26, delay: ((i * 37) % 60) / 60 * 0.55 }}
                />
              ))}
            </div>
            <motion.p
              className="mt-8 text-center font-pixel text-xs uppercase tracking-[0.3em] text-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {site.role}
            </motion.p>
          </>
        )}

        <div className={`mt-12 flex flex-col items-center gap-5 transition-opacity duration-300 ${stage === "ready" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <button ref={startRef} type="button" onClick={finish} className="btn-pixel btn-pixel--gold text-sm">
            <span className="blink">▶</span> Press start
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-pixel text-[10px] uppercase tracking-wider">
            <Link href="/projects" className="text-dim underline-offset-4 hover:text-gold hover:underline">
              Skip to projects →
            </Link>
            <button type="button" onClick={toggleSound} aria-pressed={sound} className="text-dim hover:text-gold">
              Sound: {sound ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      <p className="absolute bottom-5 left-0 right-0 text-center font-term text-lg text-line">
        © {new Date().getFullYear()} {site.name} · Press any key
      </p>
    </div>
  );
}
