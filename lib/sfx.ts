/**
 * Tiny synthesized sound effects — no audio files to download.
 * Every sound is a few square/triangle blips generated with WebAudio.
 * Muted by default; GameProvider only calls these when the visitor turns sound on.
 * To use your own sounds instead, drop files in /public/assets/audio and swap `play`.
 */
export type Sfx = "move" | "select" | "back" | "boot" | "error" | "coin" | "secret";

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.06, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function play(s: Sfx) {
  switch (s) {
    case "move":
      blip(660, 0, 0.05, "square", 0.035);
      break;
    case "select":
      blip(523, 0, 0.07);
      blip(784, 0.07, 0.12);
      break;
    case "back":
      blip(440, 0, 0.06);
      blip(330, 0.06, 0.1);
      break;
    case "error":
      blip(160, 0, 0.18, "sawtooth", 0.05);
      break;
    case "coin":
      blip(988, 0, 0.06);
      blip(1319, 0.06, 0.22);
      break;
    case "boot":
      // A soft rising chord — original, not sampled from any console
      [262, 330, 392, 523].forEach((f, i) => blip(f, i * 0.09, 0.9 - i * 0.1, "triangle", 0.05));
      blip(1047, 0.42, 0.9, "sine", 0.03);
      break;
    case "secret":
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => blip(f, i * 0.08, 0.12, "square", 0.04));
      break;
  }
}

/** Must be called from a user gesture so browsers allow audio. */
export function unlockAudio() {
  audio();
}
