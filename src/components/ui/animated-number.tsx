"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
};

export const AnimatedNumber = ({ value, decimals = 0, suffix = "", duration = 900 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const from = previousValueRef.current;
    const to = Number.isFinite(value) ? value : 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = from + (to - from) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      previousValueRef.current = to;
    };

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, value]);

  const formattedValue = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(displayValue),
    [decimals, displayValue]
  );

  return (
    <span>
      {formattedValue}
      {suffix}
    </span>
  );
};
