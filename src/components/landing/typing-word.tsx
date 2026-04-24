"use client";

import { useEffect, useMemo, useState } from "react";

const words = ["inteligente", "adaptable", "innovador", "estratégico", "conectado"];

const typeDelay = 135;
const eraseDelay = 80;
const pauseDelay = 1850;

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return reducedMotion;
};

export const TypingWord = () => {
  const reducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [letterCount, setLetterCount] = useState(words[0].length);
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">("pausing");

  const currentWord = words[wordIndex];
  const longestWord = useMemo(() => words.reduce((longest, word) => (word.length > longest.length ? word : longest), words[0]), []);

  useEffect(() => {
    if (reducedMotion) {
      setWordIndex(0);
      setLetterCount(words[0].length);
      setPhase("pausing");
      return;
    }

    const timeout = window.setTimeout(
      () => {
        if (phase === "typing") {
          if (letterCount < currentWord.length) {
            setLetterCount((current) => current + 1);
            return;
          }

          setPhase("pausing");
          return;
        }

        if (phase === "pausing") {
          setPhase("erasing");
          return;
        }

        if (letterCount > 0) {
          setLetterCount((current) => current - 1);
          return;
        }

        setWordIndex((current) => (current + 1) % words.length);
        setPhase("typing");
      },
      phase === "pausing" ? pauseDelay : phase === "typing" ? typeDelay : eraseDelay
    );

    return () => window.clearTimeout(timeout);
  }, [currentWord.length, letterCount, phase, reducedMotion]);

  const visibleWord = reducedMotion ? words[0] : currentWord.slice(0, letterCount);

  return (
    <span className="inline-grid min-h-[1.08em] min-w-[11ch] grid-cols-1 items-baseline whitespace-nowrap gradient-text" aria-label={currentWord}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {longestWord}.
      </span>
      <span className="col-start-1 row-start-1 inline-flex items-baseline">
        {visibleWord}.
        <span className="typing-cursor ml-1 inline-block h-[0.86em] w-[0.08em] translate-y-[0.08em] rounded-full bg-violet-500 dark:bg-violet-300" aria-hidden="true" />
      </span>
    </span>
  );
};
