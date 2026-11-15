import * as THREE from "three";

/**
 * PS2-era look, applied per material:
 *  • vertex snapping — vertices jitter to a coarse screen grid (the classic wobble)
 *  • colour quantisation with a 4×4 Bayer dither (16-bit framebuffer feel)
 * The canvas itself is rendered at a low resolution and scaled up with nearest-neighbour.
 */
export const retroUniforms = {
  uSnap: { value: new THREE.Vector2(160, 120) },
  uLevels: { value: 22 },
};

export function retroify<T extends THREE.Material>(mat: T): T {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSnap = retroUniforms.uSnap;
    shader.uniforms.uLevels = retroUniforms.uLevels;
    shader.vertexShader =
      "uniform vec2 uSnap;\n" +
      shader.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 snapPos = gl_Position;
        snapPos.xy = floor((snapPos.xy / snapPos.w) * uSnap + 0.5) / uSnap * snapPos.w;
        gl_Position = snapPos;`,
      );
    shader.fragmentShader =
      "uniform float uLevels;\n" +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        int bx = int(mod(gl_FragCoord.x, 4.0));
        int by = int(mod(gl_FragCoord.y, 4.0));
        int bi = by * 4 + bx;
        float bayer[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
        float th = bayer[bi] / 16.0 - 0.5;
        gl_FragColor.rgb = floor(gl_FragColor.rgb * uLevels + th + 0.5) / uLevels;`,
      );
  };
  mat.customProgramCacheKey = () => "retro-v1";
  return mat;
}

const cache = new Map<string, THREE.Material>();

/** Cached flat-shaded Lambert material with the retro treatment. */
export function mat(color: string, emissive?: string, emissiveIntensity = 1) {
  const key = `${color}|${emissive ?? ""}|${emissiveIntensity}`;
  let m = cache.get(key);
  if (!m) {
    m = retroify(
      new THREE.MeshLambertMaterial({
        color,
        emissive: emissive ?? "#000000",
        emissiveIntensity,
        flatShading: true,
      }),
    );
    cache.set(key, m);
  }
  return m;
}

/** Build a tiny nearest-filtered texture from rows of palette keys. */
export function pixelTexture(rows: string[], palette: Record<string, string>, repeat: [number, number] = [1, 1]) {
  const h = rows.length;
  const w = rows[0].length;
  const data = new Uint8Array(w * h * 4);
  const c = new THREE.Color();
  rows.forEach((row, y) => {
    row.split("").forEach((k, x) => {
      c.set(palette[k] ?? "#ff00ff");
      // DataTexture rows start at the bottom
      const i = ((h - 1 - y) * w + x) * 4;
      data[i] = Math.round(c.r * 255);
      data[i + 1] = Math.round(c.g * 255);
      data[i + 2] = Math.round(c.b * 255);
      data[i + 3] = 255;
    });
  });
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function texturedMat(tex: THREE.Texture) {
  return retroify(new THREE.MeshLambertMaterial({ map: tex, flatShading: true }));
}

/** A small canvas the scene can draw into (CRT and arcade screens). */
export function canvasScreen(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, tex };
}
