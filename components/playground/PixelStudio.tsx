"use client";

import { useEffect, useRef, useState } from "react";
import { PALETTE as AVATAR, SPRITE } from "@/lib/avatarSprite";

const N = 16;
const COLORS = ["#07080f", "#2c3166", "#9b7bff", "#ff5ea8", "#ff3d3d", "#ff8a3d", "#ffcc33", "#fff1c2", "#5ee6c9", "#3c8f6a", "#3d7bff", "#9491bf", "#f3f0e7", "#d9a07a", "#8a6a4a", "#ffffff"];
type Tool = "pen" | "erase" | "fill";

/** Starts with a 16×16 crop of the avatar's head as a friendly first sprite. */
function starter(): (string | null)[] {
  const g: (string | null)[] = Array(N * N).fill(null);
  for (let y = 0; y < Math.min(N, SPRITE.length); y++) {
    for (let x = 0; x < N; x++) {
      const k = SPRITE[y][x];
      g[y * N + x] = k === "." ? null : AVATAR[k];
    }
  }
  return g;
}

export function PixelStudio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<(string | null)[]>(starter);
  const [color, setColor] = useState(COLORS[6]);
  const [tool, setTool] = useState<Tool>("pen");
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const s = c.width / N;
    for (let i = 0; i < N * N; i++) {
      const x = i % N;
      const y = Math.floor(i / N);
      ctx.fillStyle = grid[i] ?? ((x + y) % 2 ? "#1d2147" : "#151833");
      ctx.fillRect(x * s, y * s, s, s);
    }
  }, [grid]);

  const cellAt = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * N);
    const y = Math.floor(((e.clientY - r.top) / r.height) * N);
    return x >= 0 && x < N && y >= 0 && y < N ? y * N + x : -1;
  };

  const apply = (i: number) => {
    if (i < 0) return;
    setGrid((g) => {
      if (tool === "fill") {
        const target = g[i];
        if (target === color) return g;
        const next = [...g];
        const stack = [i];
        while (stack.length) {
          const j = stack.pop()!;
          if (next[j] !== target) continue;
          next[j] = color;
          const x = j % N;
          if (x > 0) stack.push(j - 1);
          if (x < N - 1) stack.push(j + 1);
          if (j >= N) stack.push(j - N);
          if (j < N * (N - 1)) stack.push(j + N);
        }
        return next;
      }
      const v = tool === "erase" ? null : color;
      if (g[i] === v) return g;
      const next = [...g];
      next[i] = v;
      return next;
    });
  };

  const save = () => {
    const c = document.createElement("canvas");
    c.width = c.height = N * 16;
    const ctx = c.getContext("2d")!;
    grid.forEach((v, i) => {
      if (!v) return;
      ctx.fillStyle = v;
      ctx.fillRect((i % N) * 16, Math.floor(i / N) * 16, 16, 16);
    });
    const a = document.createElement("a");
    a.download = "sprite.png";
    a.href = c.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <canvas
        ref={canvas}
        width={512}
        height={512}
        className="pixelated aspect-square w-full touch-none bg-void"
        role="img"
        aria-label="16 by 16 pixel drawing canvas"
        onPointerDown={(e) => {
          drawing.current = tool !== "fill";
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          apply(cellAt(e));
        }}
        onPointerMove={(e) => drawing.current && apply(cellAt(e))}
        onPointerUp={() => (drawing.current = false)}
      />
      <div className="space-y-5">
        <fieldset>
          <legend className="font-pixel text-[10px] uppercase text-dim">Tool</legend>
          <div className="mt-1 flex gap-1">
            {(["pen", "erase", "fill"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={tool === t} onClick={() => setTool(t)} className={`flex-1 px-2 py-2 font-pixel text-[10px] uppercase ${tool === t ? "bg-mint text-void" : "bg-panel-2 text-dim"}`}>
                {t}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-pixel text-[10px] uppercase text-dim">Colour</legend>
          <div className="mt-1 grid grid-cols-8 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
                onClick={() => {
                  setColor(c);
                  if (tool === "erase") setTool("pen");
                }}
                className={`aspect-square ${color === c ? "ring-4 ring-gold ring-offset-2 ring-offset-panel" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>
        <div className="flex gap-2">
          <button type="button" onClick={save} className="btn-pixel btn-pixel--gold flex-1 justify-center text-[10px]">
            Save PNG
          </button>
          <button type="button" onClick={() => setGrid(Array(N * N).fill(null))} className="btn-pixel flex-1 justify-center text-[10px]">
            Clear
          </button>
        </div>
        <p className="font-term text-lg text-dim">Draw with mouse or finger. Saves at 256×256.</p>
      </div>
    </div>
  );
}
