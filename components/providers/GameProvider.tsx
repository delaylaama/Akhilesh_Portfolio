"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { play as playSfx, unlockAudio, type Sfx } from "@/lib/sfx";

type GameState = {
  sound: boolean;
  toggleSound: () => void;
  sfx: (s: Sfx) => void;
  reducedMotion: boolean;
  /** Konami code found */
  secret: boolean;
  /** Section keys visited this session (for the contact "mission complete" screen) */
  visited: string[];
};

const Ctx = createContext<GameState | null>(null);

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function safeGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, v: string) {
  try {
    window.localStorage.setItem(key, v);
  } catch {
    /* storage blocked — fine */
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Sound is OFF by default, always. Only a visitor's explicit choice turns it on.
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [secret, setSecret] = useState(false);

  useEffect(() => {
    if (safeGet("sound") === "on") setSound(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const sfx = useCallback((s: Sfx) => {
    if (sound) playSfx(s);
  }, [sound]);

  const toggleSound = useCallback(() => {
    setSound((on) => {
      const next = !on;
      safeSet("sound", next ? "on" : "off");
      if (next) {
        unlockAudio();
        playSfx("coin");
      }
      return next;
    });
  }, []);

  // Easter egg: ↑↑↓↓←→←→BA anywhere
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        setSecret((s) => !s);
        if (sound) playSfx("secret");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sound]);

  useEffect(() => {
    document.documentElement.dataset.secret = secret ? "on" : "off";
  }, [secret]);

  // Remember which sections were explored this session
  const pathname = usePathname();
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    const key = pathname === "/" ? "home" : pathname.split("/")[1];
    let list: string[] = [];
    try {
      list = JSON.parse(window.sessionStorage.getItem("visited") || "[]");
    } catch {
      /* ignore */
    }
    if (!list.includes(key)) list.push(key);
    try {
      window.sessionStorage.setItem("visited", JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setVisited(list);
  }, [pathname]);

  const value = useMemo(() => ({ sound, toggleSound, sfx, reducedMotion, secret, visited }), [sound, toggleSound, sfx, reducedMotion, secret, visited]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame must be used inside GameProvider");
  return v;
}
