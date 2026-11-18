'use client';

import { useEffect, useState } from 'react';
import { getCountdownToNextEdition } from './dates';

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** null until mounted, to avoid a hydration mismatch. */
export function useCountdown() {
  const [value, setValue] = useState<ReturnType<typeof getCountdownToNextEdition> | null>(null);
  useEffect(() => {
    const update = () => setValue(getCountdownToNextEdition());
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return value;
}
