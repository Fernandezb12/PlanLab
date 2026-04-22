"use client";

import { useEffect, useState } from "react";

type AnimatedBarProps = {
  value: number;
  className?: string;
};

export const AnimatedBar = ({ value, className = "" }: AnimatedBarProps) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setWidth(Math.max(0, Math.min(100, value)));
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [value]);

  return <div className={className} style={{ width: `${width}%` }} />;
};
