"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Markers, ProceduralRoom } from "./Room";
import { hotspots, type HotspotKey } from "./hotspots";
import { retroUniforms, retroify } from "./retro";
import { site } from "@/content/site";

export type RoomCanvasProps = {
  /** Highlighted object (hover in 3D, or focus in the menu) */
  active: HotspotKey | null;
  /** Object the camera frames (menu focus / keyboard) */
  focus: HotspotKey | null;
  /** Object being entered: camera dollies in before navigating */
  entering: HotspotKey | null;
  /** Internal render height in pixels — lower = chunkier */
  resolution: number;
  reducedMotion: boolean;
  compact: boolean;
  day: boolean;
  onHover: (k: HotspotKey | null) => void;
  onSelect: (k: HotspotKey) => void;
  onToggleDay: () => void;
};

const BASE_POS = new THREE.Vector3(6.6, 5.6, 10.6);
const BASE_POS_COMPACT = new THREE.Vector3(8.6, 7.0, 10.4);
const BASE_LOOK = new THREE.Vector3(-2.0, 1.0, 0.0);
const BASE_LOOK_COMPACT = new THREE.Vector3(-0.4, 1.0, -1.2);

function Rig({ focus, entering, reducedMotion, compact }: Pick<RoomCanvasProps, "focus" | "entering" | "reducedMotion" | "compact">) {
  const { camera, pointer } = useThree();
  const look = useRef(BASE_LOOK.clone());
  const tPos = useMemo(() => new THREE.Vector3(), []);
  const tLook = useMemo(() => new THREE.Vector3(), []);
  const first = useRef(true);

  useFrame((_, dt) => {
    const key = entering ?? focus;
    const hs = key ? hotspots.find((h) => h.key === key) : undefined;
    if (hs) {
      tPos.set(...hs.cam);
      tLook.set(...hs.look);
      if (entering) tPos.lerp(tLook, 0.45);
    } else {
      tPos.copy(compact ? BASE_POS_COMPACT : BASE_POS);
      tLook.copy(compact ? BASE_LOOK_COMPACT : BASE_LOOK);
    }
    if (!reducedMotion && !compact && !entering) {
      tPos.x += pointer.x * 0.6;
      tPos.y += pointer.y * 0.35;
    }
    const k = reducedMotion || first.current ? 1 : 1 - Math.exp(-dt * (entering ? 4.5 : 2.6));
    first.current = false;
    camera.position.lerp(tPos, k);
    look.current.lerp(tLook, k);
    camera.lookAt(look.current);
  });
  return null;
}

/** Keeps the vertex-snap grid matched to the framebuffer, so the wobble stays one "pixel" big */
function SnapSync() {
  const { size, viewport } = useThree();
  useEffect(() => {
    const w = size.width * viewport.dpr;
    const h = size.height * viewport.dpr;
    retroUniforms.uSnap.value.set(w / 2, h / 2);
  }, [size, viewport.dpr]);
  return null;
}

/** A supplied .glb room. Objects named hotspot_<key> become interactive. */
function ModelRoom({ onHover, onSelect, active, animate }: Pick<RoomCanvasProps, "onHover" | "onSelect" | "active"> & { animate: boolean }) {
  const { scene } = useGLTF(site.roomModel);
  const { root, positions, owners } = useMemo(() => {
    const root = scene.clone(true);
    const positions: Partial<Record<HotspotKey, [number, number, number]>> = {};
    const owners = new Map<THREE.Object3D, HotspotKey>();
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      const m = /^hotspot_(about|work|projects|playground|contact)/i.exec(o.name);
      if (m) {
        const key = m[1].toLowerCase() as HotspotKey;
        const v = new THREE.Vector3();
        o.getWorldPosition(v);
        positions[key] = [v.x, v.y, v.z];
        owners.set(o, key);
      }
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mm) => {
          const t = (mm as THREE.MeshStandardMaterial).map;
          if (t) {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.NearestFilter;
          }
          retroify(mm);
        });
      }
    });
    return { root, positions, owners };
  }, [scene]);

  const keyOf = (o: THREE.Object3D | null): HotspotKey | null => {
    while (o) {
      const k = owners.get(o);
      if (k) return k;
      o = o.parent;
    }
    return null;
  };

  return (
    <>
      <primitive
        object={root}
        onPointerOver={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
          const k = keyOf(e.object);
          if (k) {
            e.stopPropagation();
            onHover(k);
          }
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
          const k = keyOf(e.object);
          if (k) {
            e.stopPropagation();
            onSelect(k);
          }
        }}
      />
      <hemisphereLight args={["#9aa4ff", "#2a1f3a", 1.6]} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <Markers active={active} animate={animate} positions={positions} />
    </>
  );
}

export default function RoomCanvas(props: RoomCanvasProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(0.5);

  // Render at a fixed internal height (e.g. 360px) regardless of screen size, then upscale with nearest-neighbour.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight || window.innerHeight;
      setDpr(Math.min(1, Math.max(0.15, props.resolution / h)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [props.resolution]);

  const hovering = props.active !== null;
  useEffect(() => {
    const canvas = wrap.current?.querySelector("canvas");
    if (canvas) canvas.style.cursor = hovering ? "var(--cursor-hand, pointer)" : "";
  }, [hovering]);

  const animate = !props.reducedMotion;
  const bg = props.day ? "#2a3a78" : "#07080f";

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        flat
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
        camera={{ fov: 36, near: 0.1, far: 60, position: BASE_POS.toArray() }}
        onCreated={({ gl }) => {
          gl.domElement.style.imageRendering = "pixelated";
        }}
        onPointerMissed={() => props.onHover(null)}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 14, 30]} />
        <SnapSync />
        <Rig focus={props.focus} entering={props.entering} reducedMotion={props.reducedMotion} compact={props.compact} />
        {site.roomModel ? (
          <Suspense fallback={null}>
            <ModelRoom onHover={props.onHover} onSelect={props.onSelect} active={props.active} animate={animate} />
          </Suspense>
        ) : (
          <>
            <ProceduralRoom
              active={props.active}
              day={props.day}
              animate={animate}
              onHover={props.onHover}
              onSelect={props.onSelect}
              onToggleDay={props.onToggleDay}
            />
            <Markers active={props.active} animate={animate} />
          </>
        )}
      </Canvas>
    </div>
  );
}
