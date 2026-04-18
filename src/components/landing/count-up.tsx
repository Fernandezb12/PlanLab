"use client";

import { useEffect, useRef, useState } from "react";

export const CountUp = ({ to, suffix = "", duration = 1200 }: { to: number; suffix?: string; duration?: number }) => {
  const [value, setValue] = useState(0);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Yo inicio el contador cuando la métrica entra en pantalla.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStartedRef.current) return;
        hasStartedRef.current = true;

        const finalValue = Math.max(0, to);
        const frameMs = 16;
        const steps = Math.max(1, Math.floor(duration / frameMs));
        const increment = finalValue / steps;

        let current = 0;
        const timer = window.setInterval(() => {
          current += increment;
          if (current >= finalValue) {
            setValue(finalValue);
            window.clearInterval(timer);
            return;
          }
          setValue(Math.round(current));
        }, frameMs);

        observer.disconnect();
      },
      { threshold: 0.45 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [duration, to]);

  return (
    <span ref={containerRef}>
      {value}
      {suffix}
    </span>
  );
};
