"use client";

import { useEffect, useState } from "react";
import { fmt } from "@/lib/client";

export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const loop = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{fmt(shown)}</>;
}
