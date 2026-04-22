"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

type SearchResponse = {
  plans: SearchItem[];
  activities: SearchItem[];
  students: SearchItem[];
  groups: SearchItem[];
  reports: SearchItem[];
};

const resultSections: Array<{ key: keyof SearchResponse; label: string }> = [
  { key: "plans", label: "Planes" },
  { key: "activities", label: "Actividades" },
  { key: "students", label: "Estudiantes" },
  { key: "groups", label: "Grupos" },
  { key: "reports", label: "Reportes" }
];

export const GlobalSearch = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse>({
    plans: [],
    activities: [],
    students: [],
    groups: [],
    reports: []
  });

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({
        plans: [],
        activities: [],
        students: [],
        groups: [],
        reports: []
      });
      setIsLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/search/global?q=${encodeURIComponent(query.trim())}`);
        const payload = (await response.json()) as SearchResponse & { message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "No fue posible completar la búsqueda.");
        }

        setResults({
          plans: payload.plans ?? [],
          activities: payload.activities ?? [],
          students: payload.students ?? [],
          groups: payload.groups ?? [],
          reports: payload.reports ?? []
        });
        setIsOpen(true);
      } catch (error) {
        console.error("Error real en buscador global:", error);
        setResults({
          plans: [],
          activities: [],
          students: [],
          groups: [],
          reports: []
        });
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const hasResults = useMemo(
    () => resultSections.some((section) => results[section.key].length > 0),
    [results]
  );

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (query.trim().length >= 2) {
            setIsOpen(true);
          }
        }}
        placeholder="Buscar planes, actividades, estudiantes o grupos"
        className="w-[280px] rounded-2xl border border-slate-300 bg-white/95 py-2.5 pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 md:w-[320px] lg:w-[360px] dark:border-white/15 dark:bg-white/6 dark:text-slate-100"
      />
      {isLoading ? <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" /> : null}

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-200 bg-white/98 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/96">
          <div className="border-b border-slate-200/80 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Búsqueda global</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Encuentra información clave del sistema y navega rápidamente al módulo correspondiente.</p>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-2 py-2">
            {!hasResults && query.trim().length >= 2 && !isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">No hay coincidencias por ahora</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prueba con el título del plan, el nombre del grupo, el estudiante o el tema trabajado.</p>
              </div>
            ) : null}

            {resultSections.map((section) =>
              results[section.key].length ? (
                <div key={section.key} className="mb-2">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{section.label}</p>
                  <div className="space-y-1">
                    {results[section.key].map((item) => (
                      <button
                        key={`${section.key}-${item.id}`}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                          router.push(item.href);
                        }}
                        className="w-full rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-violet-200 hover:bg-slate-100 focus:border-violet-200 focus:bg-slate-100 focus:outline-none dark:hover:border-violet-500/20 dark:hover:bg-white/8 dark:focus:border-violet-500/20 dark:focus:bg-white/8"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
