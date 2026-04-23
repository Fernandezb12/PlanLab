"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white/96 px-3 text-sm font-medium text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900 sm:px-3.5"
      aria-label="Cambiar tema"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
    </button>
  );
};
