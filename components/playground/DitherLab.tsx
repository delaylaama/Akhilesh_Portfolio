"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PALETTES: Record<string, string[]> = {
  "Handheld": ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  "1-bit": ["#07080f", "#f3f0e7"],
  "Night arcade": ["#07080f", "#2c3166", "#9b7bff", "#ff5ea8", "#ffcc33", "#f3f0e7"],
  "Risograph": ["#16151d", "#ff5ea8", "#3d7bff", "#f3f0e7"],
  "CGA": ["#000000", "#55ffff", "#ff55ff", "#ffffff"],
  "Sunset": ["#1b1f3b", "#6b3a6e", "#c8643c", "#ff8a3d", "#ffcc33", "#fff1c2"],
};

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearest(r: number, g: number, b: number, pal: number[][]) {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < pal.length; i++) {
    const p = pal[i];
    const d = (r - p[0]) ** 2 * 0.3 + (g - p[1]) ** 2 * 0.59 + (b - p[2]) ** 2 * 0.11;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return pal[best];
}

/** A built-in test card, so the lab works before anyone drops an image in. */
function drawTestCard(c: HTMLCanvasElement) {
  c.width = 480;
  c.height = 360;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 480, 360);
  g.addColorStop(0, "#1b1f3b");
  g.addColorStop(0.5, "#9b7bff");
  g.addColorStop(1, "#ffcc33");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 480, 360);
  const r = ctx.createRadialGradient(170, 170, 10, 170, 170, 130);
  r.addColorStop(0, "#fff1c2");
  r.addColorStop(1, "rgba(255,94,168,0)");
  ctx.fillStyle = r;
  ctx.beginPath();
  ctx.arc(170, 170, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#07080f";
  ctx.font = "italic 92px Georgia, serif";
  ctx.fillText("Dither", 210, 300);
}

export function DitherLab() {
  const src = useRef<HTMLCanvasElement | null>(null);
  const out = useRef<HTMLCanvasElement>(null);
  const [palette, setPalette] = useState("Night arcade");
  const [pixel, setPixel] = useState(3);
  const [mode, setMode] = useState<"bayer" | "floyd">("bayer");
  const [contrast, setContrast] = useState(1.1);
  const [drag, setDrag] = useState(false);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    src.current = document.createElement("canvas");
    drawTestCard(src.current);
    setReady((n) => n + 1);
  }, []);

  const render = useCallback(() => {
    const s = src.current;
    const o = out.current;
    if (!s || !o) return;
    const maxW = 480;
    const scale = Math.min(1, maxW / s.width);
    const w = Math.max(8, Math.floor((s.width * scale) / pixel));
    const h = Math.max(8, Math.floor((s.height * scale) / pixel));
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const t = tmp.getContext("2d", { willReadFrequently: true })!;
    t.drawImage(s, 0, 0, w, h);
    const img = t.getImageData(0, 0, w, h);
    const d = img.data;
    const pal = PALETTES[palette].map(hexToRgb);
    const spread = 255 / Math.max(1, pal.length - 1);
    const buf = new Float32Array(d.length);
    for (let i = 0; i < d.length; i++) buf[i] = i % 4 === 3 ? d[i] : (d[i] - 128) * contrast + 128;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        let r = buf[i], g = buf[i + 1], b = buf[i + 2];
        if (mode === "bayer") {
          const th = BAYER4[(y % 4) * 4 + (x % 4)] * spread;
          r += th; g += th; b += th;
        }
        const p = nearest(r, g, b, pal);
        if (mode === "floyd") {
          const er = r - p[0], eg = g - p[1], eb = b - p[2];
          const push = (dx: number, dy: number, f: number) => {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= w || ny >= h) return;
            const j = (ny * w + nx) * 4;
            buf[j] += er * f; buf[j + 1] += eg * f; buf[j + 2] += eb * f;
          };
          push(1, 0, 7 / 16); push(-1, 1, 3 / 16); push(0, 1, 5 / 16); push(1, 1, 1 / 16);
        }
        d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
      }
    }
    t.putImageData(img, 0, 0);
    o.width = w * pixel;
    o.height = h * pixel;
    const octx = o.getContext("2d")!;
    octx.imageSmoothingEnabled = false;
    octx.drawImage(tmp, 0, 0, o.width, o.height);
  }, [palette, pixel, mode, contrast]);

  useEffect(() => {
    render();
  }, [render, ready]);

  const load = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      c.getContext("2d")!.drawImage(im, 0, 0);
      src.current = c;
      URL.revokeObjectURL(url);
      setReady((n) => n + 1);
    };
    im.src = url;
  };

  const download = () => {
    const o = out.current;
    if (!o) return;
    const a = document.createElement("a");
    a.download = "dithered.png";
    a.href = o.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div
        className={`flex min-h-[260px] items-center justify-center bg-void p-3 ${drag ? "ring-4 ring-gold" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          load(e.dataTransfer.files?.[0]);
        }}
      >
        <canvas ref={out} className="pixelated h-auto max-h-[60vh] w-auto max-w-full" role="img" aria-label="Dithered image preview" />
      </div>
      <div className="space-y-5">
        <label className="btn-pixel btn-pixel--gold w-full justify-center text-[10px]">
          Load image
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => load(e.target.files?.[0])} />
        </label>
        <p className="-mt-3 font-term text-base text-dim">…or drop one on the screen. Nothing is uploaded.</p>
        <label className="block">
          <span className="font-pixel text-[10px] uppercase text-dim">Palette</span>
          <select value={palette} onChange={(e) => setPalette(e.target.value)} className="mt-1 w-full bg-panel-2 px-2 py-2 font-term text-lg text-ink">
            {Object.keys(PALETTES).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-1" aria-hidden="true">
          {PALETTES[palette].map((c) => (
            <span key={c} className="h-4 flex-1" style={{ background: c }} />
          ))}
        </div>
        <fieldset>
          <legend className="font-pixel text-[10px] uppercase text-dim">Method</legend>
          <div className="mt-1 flex gap-1">
            {(["bayer", "floyd"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 px-2 py-2 font-pixel text-[10px] uppercase ${mode === m ? "bg-mint text-void" : "bg-panel-2 text-dim"}`}
              >
                {m === "bayer" ? "Ordered" : "Diffusion"}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="flex justify-between font-pixel text-[10px] uppercase text-dim">
            Pixel size <span className="text-ink">{pixel}×</span>
          </span>
          <input type="range" min={1} max={8} value={pixel} onChange={(e) => setPixel(+e.target.value)} className="mt-2 w-full accent-[#ffcc33]" />
        </label>
        <label className="block">
          <span className="flex justify-between font-pixel text-[10px] uppercase text-dim">
            Contrast <span className="text-ink">{contrast.toFixed(1)}</span>
          </span>
          <input type="range" min={0.5} max={2} step={0.1} value={contrast} onChange={(e) => setContrast(+e.target.value)} className="mt-2 w-full accent-[#ffcc33]" />
        </label>
        <button type="button" onClick={download} className="btn-pixel w-full justify-center text-[10px]">
          Save PNG
        </button>
      </div>
    </div>
  );
}
