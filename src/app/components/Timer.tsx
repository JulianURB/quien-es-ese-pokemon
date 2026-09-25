"use client";

import { useEffect, useRef, useState } from "react";
import { ROUND_MS, speedPoints } from "@/lib/game";

const R = 34;
const C = 2 * Math.PI * R;

/**
 * Anillo de 30 segundos. Arranca al montarse (cuando aparece la silueta) y se
 * congela cuando `running` pasa a false.
 */
export function Timer({
  running,
  onExpire,
  onTick,
}: {
  running: boolean;
  onExpire: () => void;
  onTick: () => void;
}) {
  const [remaining, setRemaining] = useState(ROUND_MS);
  const handlers = useRef({ onExpire, onTick });
  useEffect(() => {
    handlers.current = { onExpire, onTick };
  });

  useEffect(() => {
    if (!running) return;
    const start = performance.now() - (ROUND_MS - remaining);
    let lastSecond = Math.ceil(remaining / 1000);
    let frame = 0;
    const loop = () => {
      const left = Math.max(0, ROUND_MS - (performance.now() - start));
      setRemaining(left);
      const second = Math.ceil(left / 1000);
      if (second !== lastSecond) {
        lastSecond = second;
        if (second <= 5 && second > 0) handlers.current.onTick();
      }
      if (left === 0) {
        handlers.current.onExpire();
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const frac = remaining / ROUND_MS;
  const color = `hsl(${Math.round(120 * frac)} 90% 52%)`;
  const urgent = running && remaining <= 5_000;

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Quedan ${Math.ceil(remaining / 1000)} segundos`}>
      <div className={`relative h-20 w-20 ${urgent ? "timer-urgent" : ""}`}>
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={R} fill="rgba(10,15,36,.85)" stroke="rgba(255,255,255,.15)" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-3xl" style={{ color }}>
          {Math.ceil(remaining / 1000)}
        </span>
      </div>
      <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs font-extrabold tabular-nums text-poke-yellow">
        +{speedPoints(ROUND_MS - remaining)} pts
      </span>
    </div>
  );
}
