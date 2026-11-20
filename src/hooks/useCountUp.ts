import { useEffect, useState } from "react";

export const COUNT_UP_DURATION_MS = 500;
const FRAME_MS = 16;

export function useCountUp(value: number, enabled: boolean): number {
  const [progress, setProgress] = useState({ value, shown: value });
  const shown = progress.value === value ? progress.shown : 0;

  useEffect(() => {
    if (!enabled) return;

    const steps = Math.max(1, Math.round(COUNT_UP_DURATION_MS / FRAME_MS));
    let frame = 0;

    const id = setInterval(() => {
      frame += 1;
      setProgress({
        value,
        shown: Math.min(Math.round((value * frame) / steps), value),
      });
      if (frame >= steps) clearInterval(id);
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [value, enabled]);

  return enabled ? shown : value;
}

//state stores { value, shown } instead of just shown
//so progress.value === value ? progress.shown : 0 derives "restart at zero" whenever value changes
//without a synchronous setState inside the effect.
