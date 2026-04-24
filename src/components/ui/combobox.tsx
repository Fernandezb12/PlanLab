"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

type ComboboxProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  customOptionLabel?: (value: string) => string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const Combobox = ({
  value,
  options,
  onChange,
  placeholder = "Selecciona o escribe",
  customOptionLabel = (customValue) => `Usar "${customValue}"`,
  disabled = false,
  className,
  inputClassName
}: ComboboxProps) => {
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const normalizedSearch = normalizeSearch(search);
  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) {
      return [...options];
    }

    return options.filter((option) => normalizeSearch(option).includes(normalizedSearch));
  }, [normalizedSearch, options]);

  const hasExactOption = options.some((option) => normalizeSearch(option) === normalizedSearch);
  const trimmedSearch = search.trim();
  const selectableOptions = trimmedSearch && !hasExactOption ? [trimmedSearch, ...filteredOptions] : filteredOptions;

  useEffect(() => {
    setActiveIndex(0);
  }, [search, options]);

  const commitValue = (nextValue: string) => {
    onChange(nextValue);
    setSearch(nextValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(selectableOptions.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!isOpen && trimmedSearch) {
        onChange(trimmedSearch);
        return;
      }

      if (isOpen) {
        event.preventDefault();
        commitValue(selectableOptions[activeIndex] ?? trimmedSearch);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled}
          value={search}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500",
            inputClassName
          )}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Abrir opciones"
        >
          <ChevronsUpDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-[90] mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/18 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/50"
        >
          {selectableOptions.length > 0 ? (
            selectableOptions.map((option, index) => {
              const isCustomOption = trimmedSearch && !hasExactOption && index === 0;
              const isSelected = normalizeSearch(option) === normalizeSearch(value);

              return (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitValue(option)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition dark:text-slate-200",
                    activeIndex === index ? "bg-violet-50 text-violet-900 dark:bg-violet-500/15 dark:text-white" : "hover:bg-slate-100 dark:hover:bg-white/10"
                  )}
                >
                  <span className="min-w-0 truncate">{isCustomOption ? customOptionLabel(option) : option}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0 text-violet-500" /> : null}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Escribe una opción personalizada.</div>
          )}
        </div>
      ) : null}
    </div>
  );
};
