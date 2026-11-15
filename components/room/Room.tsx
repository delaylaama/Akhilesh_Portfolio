"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { canvasScreen, mat, pixelTexture, retroify, texturedMat } from "./retro";
import { hotspots, type Hotspot, type HotspotKey } from "./hotspots";
import { drawSprite, SPRITE_H, SPRITE_W } from "@/lib/avatarSprite";
import { textToPixels } from "@/lib/pixelFont";
import { projects } from "@/content/projects";

type V3 = [number, number, number];
const BOX = new THREE.BoxGeometry(1, 1, 1);
const PLANE = new THREE.PlaneGeometry(1, 1);

function B({ p, s, c, e, ei, r }: { p: V3; s: V3; c: string; e?: string; ei?: number; r?: V3 }) {
  return <mesh position={p} scale={s} rotation={r} geometry={BOX} material={mat(c, e, ei)} />;
}

function Cyl({ p, r, h, c, seg = 8, e }: { p: V3; r: number; h: number; c: string; seg?: number; e?: string }) {
  return (
    <mesh position={p} material={mat(c, e)}>
      <cylinderGeometry args={[r, r, h, seg]} />
    </mesh>
  );
}

/** Draws pixel-font text into a 2D canvas */
function pixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, scale = 1) {
  ctx.fillStyle = color;
  textToPixels(text).pixels.forEach((p) => ctx.fillRect(x + p.x * scale, y + p.y * scale, scale, scale));
}

/** Animated canvas texture, redrawn at a low frame rate (it's a CRT, after all) */
function useScreen(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, frame: number) => void, fps: number, animate: boolean) {
  const screen = useMemo(() => canvasScreen(w, h), [w, h]);
  const material = useMemo(() => retroify(new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })), [screen]);
  const acc = useRef(0);
  const frame = useRef(0);
  useEffect(() => {
    draw(screen.ctx, 0);
    screen.tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  useFrame((_, dt) => {
    if (!animate) return;
    acc.current += dt;
    if (acc.current < 1 / fps) return;
    acc.current = 0;
    frame.current++;
    draw(screen.ctx, frame.current);
    screen.tex.needsUpdate = true;
  });
  return material;
}

type RoomProps = {
  active: HotspotKey | null;
  day: boolean;
  animate: boolean;
  onHover: (k: HotspotKey | null) => void;
  onSelect: (k: HotspotKey) => void;
  onToggleDay: () => void;
};

function hotspotHandlers(k: HotspotKey, onHover: RoomProps["onHover"], onSelect: RoomProps["onSelect"]) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(k);
    },
    onPointerOut: () => onHover(null),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(k);
    },
  };
}

export function ProceduralRoom({ active, day, animate, onHover, onSelect, onToggleDay }: RoomProps) {
  const floorMat = useMemo(
    () =>
      texturedMat(
        pixelTexture(
          ["aaaaaaac", "aaaaaaac", "cccccccc", "bbbcbbbb", "bbbcbbbb", "cccccccc", "dddddcdd", "cccccccc"],
          { a: "#5a4466", b: "#514060", c: "#3e3050", d: "#5e4870" },
          [6, 6],
        ),
      ),
    [],
  );
  const wallMat = useMemo(
    () =>
      texturedMat(
        pixelTexture(
          ["pppppppp", "pppqpppp", "ppqrqppp", "pppqpppp", "pppppppp", "pppppppq", "pppppprq", "pppppppq"],
          { p: "#2a2f5c", q: "#323870", r: "#3d4486" },
          [10, 5],
        ),
      ),
    [],
  );
  const wallMatSide = useMemo(() => {
    const m = wallMat.clone() as THREE.MeshLambertMaterial;
    return retroify(m);
  }, [wallMat]);

  const featured = useMemo(() => projects.filter((p) => p.featured).slice(0, 6), []);

  // CRT monitor: a tiny "inventory" UI
  const monitorMat = useScreen(
    96,
    72,
    (ctx, f) => {
      ctx.fillStyle = "#0d1430";
      ctx.fillRect(0, 0, 96, 72);
      ctx.fillStyle = "#ffcc33";
      ctx.fillRect(0, 0, 96, 9);
      pixelText(ctx, "WORK", 3, 2, "#0d1430");
      const items = featured.length ? featured : [];
      for (let i = 0; i < 6; i++) {
        const x = 6 + (i % 3) * 30;
        const y = 16 + Math.floor(i / 3) * 26;
        ctx.fillStyle = "#1d2147";
        ctx.fillRect(x, y, 24, 20);
        const p = items[i];
        if (p) {
          ctx.fillStyle = p.accent ?? "#9b7bff";
          ctx.fillRect(x + 4, y + 4, 16, 12);
        } else {
          ctx.fillStyle = "#2c3166";
          ctx.fillRect(x + 10, y + 9, 4, 2);
        }
        if (i === f % Math.max(1, items.length || 6)) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 1.5, y - 1.5, 27, 23);
        }
      }
      // scanline
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, (f * 3) % 72, 96, 2);
    },
    3,
    animate,
  );

  // Arcade screen: scrolling stars, a little ship, PLAY
  const arcadeMat = useScreen(
    48,
    40,
    (ctx, f) => {
      ctx.fillStyle = "#05030c";
      ctx.fillRect(0, 0, 48, 40);
      for (let i = 0; i < 14; i++) {
        const sx = (i * 37) % 48;
        const sy = (i * 23 + f * (1 + (i % 3))) % 40;
        ctx.fillStyle = i % 3 ? "#5ee6c9" : "#ffffff";
        ctx.fillRect(sx, sy, 1, 1);
      }
      if (f % 4 < 3) pixelText(ctx, "PLAY", 13, 6, "#ff5ea8");
      const shipX = 22 + Math.round(Math.sin(f / 3) * 10);
      ctx.fillStyle = "#ffcc33";
      ctx.fillRect(shipX, 32, 5, 2);
      ctx.fillRect(shipX + 2, 30, 1, 2);
      if (f % 2) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(shipX + 2, 22 - (f % 6) * 2, 1, 2);
      }
    },
    6,
    animate,
  );

  // Pinboard portrait of the pixel avatar
  const portraitMat = useScreen(
    SPRITE_W + 8,
    SPRITE_H + 8,
    (ctx, f) => {
      ctx.fillStyle = "#5ee6c9";
      ctx.fillRect(0, 0, SPRITE_W + 8, SPRITE_H + 8);
      drawSprite(ctx, 4, 4, 1, { blink: f % 12 === 0 });
    },
    4,
    animate,
  );

  // Window sky (day / night)
  const skyMat = useScreen(
    40,
    34,
    (ctx, f) => {
      const g = ctx.createLinearGradient(0, 0, 0, 34);
      if (day) {
        g.addColorStop(0, "#5aa8ff");
        g.addColorStop(1, "#bfe3ff");
      } else {
        g.addColorStop(0, "#0a0b2a");
        g.addColorStop(1, "#2a2a6a");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 40, 34);
      if (day) {
        ctx.fillStyle = "#ffffff";
        const cx = (f % 60) - 10;
        ctx.fillRect(cx, 10, 10, 3);
        ctx.fillRect(cx + 2, 8, 5, 2);
        ctx.fillStyle = "#fff1a8";
        ctx.fillRect(28, 4, 6, 6);
      } else {
        ctx.fillStyle = "#f3f0e7";
        ctx.fillRect(28, 5, 5, 5);
        ctx.fillStyle = "#0a0b2a";
        ctx.fillRect(30, 4, 4, 4);
        [[4, 6], [12, 3], [20, 12], [8, 18], [33, 20], [16, 24]].forEach(([x, y], i) => {
          ctx.fillStyle = (f + i) % 5 === 0 ? "#5ee6c9" : "#ffffff";
          ctx.fillRect(x, y, 1, 1);
        });
      }
      // city silhouette
      ctx.fillStyle = day ? "#6b7bb0" : "#12122e";
      [[0, 26, 6], [6, 22, 5], [11, 28, 7], [18, 20, 4], [22, 25, 8], [30, 23, 5], [35, 27, 5]].forEach(([x, y, w]) => ctx.fillRect(x, y, w, 34 - y));
      if (!day) {
        ctx.fillStyle = "#ffcc33";
        [[8, 25], [19, 23], [24, 28], [32, 26]].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
      }
    },
    2,
    true,
  );

  // Poster on the left wall
  const posterMat = useScreen(
    36,
    50,
    (ctx) => {
      ctx.fillStyle = "#f3f0e7";
      ctx.fillRect(0, 0, 36, 50);
      ctx.fillStyle = "#ff5ea8";
      ctx.beginPath();
      ctx.arc(18, 17, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#16151d";
      ctx.fillRect(4, 30, 28, 1);
      pixelText(ctx, "MAKE", 6, 34, "#16151d");
      pixelText(ctx, "STUFF", 3, 41, "#16151d");
    },
    1,
    false,
  );

  // Disc shelf: deterministic spread of colourful cases
  const cases = useMemo(() => {
    const colors = ["#ff5ea8", "#ffcc33", "#5ee6c9", "#9b7bff", "#f3f0e7", "#ff8a3d", "#3d7bff", "#1d2147"];
    const out: { p: V3; c: string; r: number }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    [1.3, 1.95, 2.6].forEach((y, row) => {
      let z = -2.3;
      while (z < -0.35) {
        const gap = rnd() < 0.12;
        if (!gap) out.push({ p: [-3.78, y + 0.26, z], c: colors[Math.floor(rnd() * colors.length)], r: rnd() < 0.08 ? 0.18 : 0 });
        z += gap ? 0.2 : 0.115 + row * 0.005;
      }
    });
    return out;
  }, []);

  const phone = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!phone.current) return;
    const ring = animate && active === "contact";
    phone.current.rotation.z = ring ? Math.sin(state.clock.elapsedTime * 40) * 0.05 : 0;
  });

  const h = (k: HotspotKey) => hotspotHandlers(k, onHover, onSelect);

  return (
    <group>
      {/* Shell */}
      <mesh position={[0, -0.1, 0]} scale={[8.2, 0.2, 8.2]} geometry={BOX} material={floorMat} />
      <mesh position={[0, 2, -4.1]} scale={[8.2, 4, 0.2]} geometry={BOX} material={wallMat} />
      <mesh position={[-4.1, 2, 0]} scale={[0.2, 4, 8.2]} geometry={BOX} material={wallMatSide} />
      <B p={[0, 0.08, -3.98]} s={[8, 0.16, 0.04]} c="#1a1d3d" />
      <B p={[-3.98, 0.08, 0]} s={[0.04, 0.16, 8]} c="#1a1d3d" />
      <B p={[0, 4.02, -4.1]} s={[8.2, 0.06, 0.24]} c="#1a1d3d" />
      <B p={[-4.1, 4.02, 0]} s={[0.24, 0.06, 8.2]} c="#1a1d3d" />

      {/* Rug */}
      <B p={[0.6, 0.01, -1.0]} s={[3.2, 0.02, 2.2]} c="#9b7bff" />
      <B p={[0.6, 0.022, -1.0]} s={[2.9, 0.02, 1.9]} c="#4b2f62" />

      {/* ── WORK: desk + CRT ── */}
      <group {...h("work")}>
        <B p={[0.8, 1.0, -3.4]} s={[2.8, 0.12, 1.1]} c="#8a6a4a" />
        {[[-0.45, -3.0], [2.05, -3.0], [-0.45, -3.85], [2.05, -3.85]].map(([x, z], i) => (
          <B key={i} p={[x, 0.47, z]} s={[0.1, 0.94, 0.1]} c="#5e4630" />
        ))}
        <B p={[1.65, 0.6, -3.45]} s={[0.75, 0.7, 0.9]} c="#7a5a3d" />
        <B p={[1.65, 0.75, -2.99]} s={[0.3, 0.05, 0.02]} c="#ffcc33" />
        <B p={[0.55, 1.1, -3.45]} s={[0.5, 0.08, 0.45]} c="#cfc8b4" />
        <B p={[0.55, 1.52, -3.5]} s={[0.95, 0.8, 0.8]} c="#d8d2c0" />
        <B p={[0.55, 1.5, -3.95]} s={[0.7, 0.6, 0.3]} c="#c6bfaa" />
        <mesh position={[0.55, 1.54, -3.095]} scale={[0.74, 0.56, 1]} geometry={PLANE} material={monitorMat} />
        <B p={[0.88, 1.17, -3.09]} s={[0.06, 0.03, 0.01]} c="#5ee6c9" e="#5ee6c9" />
        <B p={[0.55, 1.08, -2.95]} s={[0.8, 0.04, 0.25]} c="#cfc8b4" />
        <B p={[1.15, 1.08, -2.95]} s={[0.1, 0.04, 0.15]} c="#cfc8b4" />
        <Cyl p={[-0.2, 1.15, -3.0]} r={0.07} h={0.18} c="#ff5ea8" />
        <B p={[-0.25, 1.08, -3.6]} s={[0.22, 0.02, 0.22]} c="#3d7bff" />
        <B p={[-0.24, 1.1, -3.62]} s={[0.22, 0.02, 0.22]} c="#ff8a3d" r={[0, 0.3, 0]} />
        {/* Lamp */}
        <Cyl p={[1.9, 1.08, -3.7]} r={0.12} h={0.04} c="#1d2147" />
        <B p={[1.9, 1.42, -3.7]} s={[0.04, 0.68, 0.04]} c="#1d2147" />
        <mesh position={[1.8, 1.78, -3.5]} rotation={[0.9, 0, 0.3]} material={mat("#ffcc33")}>
          <coneGeometry args={[0.16, 0.22, 6, 1, true]} />
        </mesh>
        <mesh position={[1.78, 1.72, -3.45]} material={mat("#fff1c2", "#fff1c2", 1)}>
          <sphereGeometry args={[0.06, 6, 4]} />
        </mesh>
        {/* Chair */}
        <B p={[0.6, 0.6, -2.35]} s={[0.6, 0.08, 0.6]} c="#3a3f7a" />
        <B p={[0.6, 1.0, -2.05]} s={[0.6, 0.7, 0.08]} c="#3a3f7a" />
        <Cyl p={[0.6, 0.32, -2.35]} r={0.04} h={0.52} c="#1d2147" />
        <B p={[0.6, 0.06, -2.35]} s={[0.6, 0.04, 0.08]} c="#1d2147" />
        <B p={[0.6, 0.06, -2.35]} s={[0.08, 0.04, 0.6]} c="#1d2147" />
      </group>

      {/* ── ABOUT: pinboard with portrait ── */}
      <group {...h("about")}>
        <B p={[-1.35, 2.25, -3.99]} s={[1.5, 1.1, 0.04]} c="#6b4a2f" />
        <B p={[-1.35, 2.25, -3.97]} s={[1.4, 1.0, 0.04]} c="#b5835a" />
        <mesh position={[-1.68, 2.3, -3.94]} scale={[0.38, 0.5, 1]} geometry={PLANE} material={portraitMat} />
        <B p={[-1.05, 2.5, -3.945]} s={[0.26, 0.26, 0.01]} c="#ffcc33" r={[0, 0, 0.08]} />
        <B p={[-0.85, 2.05, -3.945]} s={[0.24, 0.24, 0.01]} c="#ff5ea8" r={[0, 0, -0.1]} />
        <B p={[-1.2, 1.98, -3.945]} s={[0.3, 0.2, 0.01]} c="#f3f0e7" r={[0, 0, 0.05]} />
        <B p={[-1.68, 2.58, -3.93]} s={[0.04, 0.04, 0.03]} c="#ff3d3d" />
        <B p={[-1.05, 2.6, -3.93]} s={[0.04, 0.04, 0.03]} c="#3d7bff" />
      </group>

      {/* ── PROJECTS: disc shelf ── */}
      <group {...h("projects")}>
        {[1.3, 1.95, 2.6].map((y) => (
          <B key={y} p={[-3.78, y, -1.3]} s={[0.44, 0.06, 2.2]} c="#8a6a4a" />
        ))}
        <B p={[-3.78, 1.98, -0.2]} s={[0.44, 1.42, 0.06]} c="#7a5a3d" />
        <B p={[-3.78, 1.98, -2.4]} s={[0.44, 1.42, 0.06]} c="#7a5a3d" />
        {cases.map((c, i) => (
          <B key={i} p={c.p} s={[0.32, 0.46, 0.09]} c={c.c} r={[c.r, 0, 0]} />
        ))}
      </group>

      {/* ── PLAYGROUND: arcade cabinet ── */}
      <group position={[-3.05, 0, -3.15]} rotation={[0, Math.PI / 4, 0]} {...h("playground")}>
        <B p={[0, 1.0, 0]} s={[0.9, 2.0, 0.85]} c="#2b2f6b" />
        <B p={[0.455, 1.0, 0]} s={[0.02, 1.9, 0.6]} c="#ff5ea8" />
        <B p={[-0.455, 1.0, 0]} s={[0.02, 1.9, 0.6]} c="#ff5ea8" />
        <B p={[0, 1.45, 0.43]} s={[0.78, 0.66, 0.02]} c="#0a0a14" />
        <mesh position={[0, 1.46, 0.445]} rotation={[-0.12, 0, 0]} scale={[0.64, 0.54, 1]} geometry={PLANE} material={arcadeMat} />
        <B p={[0, 1.05, 0.55]} s={[0.9, 0.12, 0.38]} c="#1d2147" r={[0.25, 0, 0]} />
        <Cyl p={[-0.2, 1.17, 0.6]} r={0.02} h={0.14} c="#12121f" />
        <mesh position={[-0.2, 1.25, 0.6]} material={mat("#ff3d3d")}>
          <sphereGeometry args={[0.05, 6, 4]} />
        </mesh>
        <Cyl p={[0.12, 1.13, 0.62]} r={0.04} h={0.03} c="#ffcc33" seg={6} />
        <Cyl p={[0.25, 1.13, 0.58]} r={0.04} h={0.03} c="#5ee6c9" seg={6} />
        <B p={[0, 1.93, 0.4]} s={[0.9, 0.22, 0.1]} c="#ff5ea8" e="#ff5ea8" ei={0.6} />
        <B p={[0, 0.3, 0.43]} s={[0.84, 0.5, 0.02]} c="#12121f" />
        <B p={[-0.1, 0.38, 0.445]} s={[0.06, 0.1, 0.01]} c="#ffcc33" e="#ffcc33" ei={0.8} />
        <B p={[0.1, 0.38, 0.445]} s={[0.06, 0.1, 0.01]} c="#ffcc33" e="#ffcc33" ei={0.8} />
      </group>

      {/* ── CONTACT: side table + telephone ── */}
      <group {...h("contact")}>
        <Cyl p={[3.0, 0.78, -1.0]} r={0.45} h={0.06} c="#6b4a2f" />
        <Cyl p={[3.0, 0.4, -1.0]} r={0.06} h={0.76} c="#5e4630" seg={6} />
        <Cyl p={[3.0, 0.02, -1.0]} r={0.3} h={0.04} c="#5e4630" />
        <group ref={phone} position={[3.0, 0.81, -1.0]} rotation={[0, -0.5, 0]}>
          <B p={[0, 0.08, 0]} s={[0.42, 0.14, 0.32]} c="#ff5ea8" />
          <B p={[0, 0.17, -0.02]} s={[0.36, 0.04, 0.18]} c="#e04d93" />
          <mesh position={[0, 0.21, -0.02]} rotation={[0, 0, Math.PI / 2]} material={mat("#ff5ea8")}>
            <capsuleGeometry args={[0.05, 0.3, 2, 6]} />
          </mesh>
          <Cyl p={[0, 0.16, 0.1]} r={0.08} h={0.02} c="#f3f0e7" />
        </group>
        {/* Letters waiting */}
        <B p={[2.82, 0.83, -0.72]} s={[0.24, 0.02, 0.16]} c="#f3f0e7" r={[0, 0.4, 0]} />
        <B p={[2.84, 0.85, -0.7]} s={[0.24, 0.02, 0.16]} c="#ffcc33" r={[0, 0.1, 0]} />
      </group>

      {/* Window (click to toggle day / night) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onToggleDay();
        }}
      >
        <B p={[2.55, 2.35, -3.98]} s={[1.5, 1.3, 0.06]} c="#e7e2d3" />
        <mesh position={[2.55, 2.35, -3.94]} scale={[1.3, 1.1, 1]} geometry={PLANE} material={skyMat} />
        <B p={[2.55, 2.35, -3.92]} s={[0.05, 1.1, 0.03]} c="#e7e2d3" />
        <B p={[2.55, 2.35, -3.92]} s={[1.3, 0.05, 0.03]} c="#e7e2d3" />
        <B p={[2.55, 1.67, -3.85]} s={[1.6, 0.06, 0.25]} c="#e7e2d3" />
      </group>

      {/* Plant, poster, books — set dressing */}
      <Cyl p={[3.4, 0.2, -3.4]} r={0.25} h={0.4} c="#c8643c" seg={7} />
      {[[3.4, 0.62, -3.4, 0.32], [3.22, 0.85, -3.3, 0.22], [3.55, 0.9, -3.5, 0.2], [3.38, 1.08, -3.42, 0.16]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={mat(i % 2 ? "#4fae7f" : "#3c8f6a")}>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
      <mesh position={[-3.97, 2.35, 0.75]} rotation={[0, Math.PI / 2, 0]} scale={[0.9, 1.25, 1]} geometry={PLANE} material={posterMat} />
      <B p={[-3.2, 0.06, 0.6]} s={[0.5, 0.12, 0.36]} c="#3d7bff" />
      <B p={[-3.18, 0.17, 0.58]} s={[0.46, 0.1, 0.34]} c="#ffcc33" r={[0, 0.15, 0]} />
      <B p={[-3.2, 0.26, 0.6]} s={[0.4, 0.08, 0.3]} c="#ff5ea8" r={[0, -0.1, 0]} />

      <Lights day={day} />
    </group>
  );
}

function Lights({ day }: { day: boolean }) {
  return (
    <>
      <hemisphereLight args={[day ? "#dfe8ff" : "#7d86e8", day ? "#6a5a52" : "#2a1f3a", day ? 2.2 : 1.1]} />
      <directionalLight position={[3, 5, -6]} intensity={day ? 2.2 : 0.7} color={day ? "#fff3d6" : "#9fb4ff"} />
      <directionalLight position={[6, 6, 6]} intensity={day ? 0.8 : 0.35} color="#ffffff" />
      <pointLight position={[1.75, 1.6, -3.3]} intensity={day ? 2 : 9} distance={5} decay={1.4} color="#ffb46b" />
      <pointLight position={[0.55, 1.5, -2.6]} intensity={day ? 0.6 : 3} distance={3} decay={1.5} color="#6e9bff" />
      <pointLight position={[-2.6, 1.6, -2.6]} intensity={day ? 1 : 5} distance={3.5} decay={1.5} color="#ff5ea8" />
    </>
  );
}

/** Bobbing pickup-style marker + floor ring + label for each hotspot */
export function Markers({ active, animate, positions }: { active: HotspotKey | null; animate: boolean; positions?: Partial<Record<HotspotKey, V3>> }) {
  return (
    <>
      {hotspots.map((hs) => (
        <Marker key={hs.key} hs={hs} active={active === hs.key} animate={animate} override={positions?.[hs.key]} />
      ))}
    </>
  );
}

const ringMat = retroify(new THREE.MeshBasicMaterial({ color: "#ffcc33", transparent: true, opacity: 0.9, toneMapped: false }));

function Marker({ hs, active, animate, override }: { hs: Hotspot; active: boolean; animate: boolean; override?: V3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const pos: V3 = override ? [override[0], override[1] + 0.6, override[2]] : hs.marker;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = pos[1] + (animate ? Math.sin(t * (active ? 6 : 2.2)) * (active ? 0.08 : 0.05) : 0);
      if (animate) ref.current.rotation.y = t * (active ? 4 : 1.4);
      const s = active ? 1.4 : 1;
      ref.current.scale.setScalar(s);
    }
    if (ring.current) {
      ring.current.visible = active;
      if (animate) ring.current.rotation.z = t * 0.8;
    }
  });
  const rx = override ? override[0] : hs.ring[0];
  const rz = override ? override[2] : hs.ring[1];
  return (
    <group>
      <mesh ref={ref} position={pos} material={mat(active ? "#ffffff" : "#ffcc33", "#ffcc33", active ? 1 : 0.7)}>
        <octahedronGeometry args={[0.11, 0]} />
      </mesh>
      <mesh ref={ring} position={[rx, 0.04, rz]} rotation={[-Math.PI / 2, 0, 0]} material={ringMat} visible={false}>
        <ringGeometry args={[hs.ring[2] * 0.86, hs.ring[2], 8, 1]} />
      </mesh>
      {active && (
        <Html position={[pos[0], pos[1] + 0.35, pos[2]]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="pixel-box pixel-box--gold whitespace-nowrap px-3 py-2 text-center">
            <div className="font-pixel text-[11px] uppercase tracking-wider text-gold">{hs.label}</div>
            <div className="font-term text-base leading-none text-ink">{hs.verb}</div>
          </div>
        </Html>
      )}
    </group>
  );
}
