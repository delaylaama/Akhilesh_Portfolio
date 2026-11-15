"use client";

import { useEffect, useRef, useState } from "react";
import { textToPixels } from "@/lib/pixelFont";
import { useGame } from "@/components/providers/GameProvider";

const W = 240;
const H = 180;
const WORDS = ["PIXEL", "GLYPH", "KERNING", "SERIF", "GRID", "VECTOR", "DESIGN", "LAYOUT"];
const ROUND = 60;

type Drop = { ch: string; x: number; y: number; v: number };

function drawText(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, color: string, s = 1) {
  ctx.fillStyle = color;
  textToPixels(t).pixels.forEach((p) => ctx.fillRect(x + p.x * s, y + p.y * s, s, s));
}
const textW = (t: string, s = 1) => textToPixels(t).width * s;

/**
 * Letters fall; move the caret to catch the next letter of the word.
 * ← → / A D or mouse / touch to move. Wrong letters cost a heart.
 */
export function KernCatch() {
  const { sfx } = useGame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"title" | "play" | "over">("title");
  const [result, setResult] = useState({ score: 0, words: 0 });
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem("kern-best") || 0));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (state !== "play") return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let x = W / 2;
    let target = x;
    const keys = { l: false, r: false };
    let word = WORDS[Math.floor(Math.random() * WORDS.length)];
    let idx = 0;
    let drops: Drop[] = [];
    let spawn = 0;
    let lives = 3;
    let score = 0;
    let words = 0;
    let time = ROUND;
    let flash = 0;
    let last = performance.now();
    let raf = 0;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.l = down;
      else if (k === "arrowright" || k === "d") keys.r = down;
      else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    const pm = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      target = ((e.clientX - r.left) / r.width) * W;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    c.addEventListener("pointermove", pm);
    c.addEventListener("pointerdown", pm);

    const end = () => {
      cancelAnimationFrame(raf);
      setResult({ score, words });
      setBest((b) => {
        const nb = Math.max(b, score);
        try {
          window.localStorage.setItem("kern-best", String(nb));
        } catch {
          /* ignore */
        }
        return nb;
      });
      sfx(score > 0 ? "coin" : "error");
      setState("over");
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) {
        raf = requestAnimationFrame(loop);
        return;
      }
      time -= dt;
      if (time <= 0 || lives <= 0) return end();

      if (keys.l) target = x - 200 * dt * 4;
      if (keys.r) target = x + 200 * dt * 4;
      x += (Math.max(10, Math.min(W - 10, target)) - x) * Math.min(1, dt * 14);

      spawn -= dt;
      if (spawn <= 0) {
        const need = word[idx];
        const ch = Math.random() < 0.45 ? need : String.fromCharCode(65 + Math.floor(Math.random() * 26));
        drops.push({ ch, x: 8 + Math.random() * (W - 16), y: -6, v: 26 + Math.random() * 18 + words * 4 });
        spawn = Math.max(0.35, 0.8 - words * 0.05);
      }
      drops.forEach((d) => (d.y += d.v * dt));
      drops = drops.filter((d) => {
        if (d.y > H - 22 && d.y < H - 12 && Math.abs(d.x + 2 - x) < 10) {
          if (d.ch === word[idx]) {
            idx++;
            score += 10;
            sfx("move");
            if (idx >= word.length) {
              words++;
              score += word.length * 10;
              sfx("coin");
              word = WORDS[(WORDS.indexOf(word) + 1 + Math.floor(Math.random() * (WORDS.length - 1))) % WORDS.length];
              idx = 0;
            }
          } else {
            lives--;
            flash = 0.25;
            sfx("error");
          }
          return false;
        }
        return d.y < H;
      });
      flash = Math.max(0, flash - dt);

      // draw
      ctx.fillStyle = flash > 0 ? "#3a0f22" : "#07080f";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#151833";
      for (let gy = 24; gy < H; gy += 12) ctx.fillRect(0, gy, W, 1);
      // word progress
      const ww = textW(word, 2);
      word.split("").forEach((ch, i) => {
        const cx = (W - ww) / 2 + i * 12;
        drawText(ctx, ch, cx, 6, i < idx ? "#5ee6c9" : i === idx ? "#ffcc33" : "#2c3166", 2);
      });
      drops.forEach((d) => drawText(ctx, d.ch, Math.round(d.x), Math.round(d.y), d.ch === word[idx] ? "#f3f0e7" : "#9491bf"));
      // caret
      ctx.fillStyle = "#ffcc33";
      ctx.fillRect(Math.round(x) - 9, H - 14, 18, 2);
      ctx.fillRect(Math.round(x) - 1, H - 20, 2, 6);
      // hud
      drawText(ctx, String(score), 4, H - 8, "#f3f0e7");
      drawText(ctx, String(Math.ceil(time)), W - textW(String(Math.ceil(time))) - 4, H - 8, "#9491bf");
      for (let i = 0; i < lives; i++) {
        ctx.fillStyle = "#ff5ea8";
        ctx.fillRect(4 + i * 7, H - 17, 5, 4);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      c.removeEventListener("pointermove", pm);
      c.removeEventListener("pointerdown", pm);
    };
  }, [state, sfx]);

  // Title / game-over frames
  useEffect(() => {
    if (state === "play") return;
    const ctx = ref.current!.getContext("2d")!;
    ctx.fillStyle = "#07080f";
    ctx.fillRect(0, 0, W, H);
    const title = state === "title" ? "KERN CATCH" : "GAME OVER";
    drawText(ctx, title, (W - textW(title, 3)) / 2, 50, state === "title" ? "#ffcc33" : "#ff5ea8", 3);
    if (state === "over") {
      const s = `SCORE ${result.score}`;
      drawText(ctx, s, (W - textW(s, 2)) / 2, 90, "#f3f0e7", 2);
      const b = `BEST ${best}`;
      drawText(ctx, b, (W - textW(b)) / 2, 112, "#9491bf");
    } else {
      const s = "CATCH THE WORD";
      drawText(ctx, s, (W - textW(s)) / 2, 90, "#9491bf");
    }
  }, [state, result, best]);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="crt relative bg-void">
        <canvas ref={ref} width={W} height={H} className="pixelated block aspect-[4/3] w-full touch-none" role="img" aria-label="Kern Catch game screen" />
        {state !== "play" && (
          <div className="absolute inset-x-0 bottom-[14%] z-10 flex justify-center">
            <button
              type="button"
              autoFocus={state === "over"}
              onClick={() => {
                sfx("select");
                setState("play");
              }}
              className="btn-pixel btn-pixel--gold text-xs"
            >
              ▶ {state === "title" ? "Press start" : "Play again"}
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3 font-term text-lg leading-snug text-dim">
        <p className="font-pixel text-[10px] uppercase text-ink">How to play</p>
        <p>Spell the word at the top by catching its letters in order.</p>
        <p><span className="text-ink">← →</span> or <span className="text-ink">A D</span> to move · mouse and touch work too.</p>
        <p>Wrong letters cost a heart. 60 seconds on the clock.</p>
        <p className="pt-2 text-gold">Best: {best}</p>
      </div>
    </div>
  );
}
