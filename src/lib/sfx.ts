// Efectos de sonido sintetizados con Web Audio: sin archivos que descargar.
import { cryUrl } from "./pokemon";

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = "square", vol = 0.06, endFreq?: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  intro() {
    [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.16));
    tone(1047, 0.36, 0.5, "square", 0.05);
    tone(1319, 0.36, 0.5, "triangle", 0.05);
  },
  pop() {
    tone(300, 0, 0.12, "triangle", 0.1, 900);
  },
  tick() {
    tone(1400, 0, 0.04, "square", 0.03);
  },
  correct() {
    [659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.07, 0.22, "triangle", 0.12));
  },
  wrong() {
    tone(260, 0, 0.18, "sawtooth", 0.05, 180);
    tone(180, 0.18, 0.3, "sawtooth", 0.05, 90);
  },
  click() {
    tone(700, 0, 0.03, "square", 0.025);
  },
  cry(pokemonId: number) {
    if (muted) return;
    const a = new Audio(cryUrl(pokemonId));
    a.volume = 0.35;
    a.play().catch(() => {});
  },
};
