import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { href: "/planes", label: "Planes" },
  { href: "/actividades", label: "Actividades" },
  { href: "/resultados", label: "Resultados" },
  { href: "/reportes", label: "Reportes" }
];

export const DashboardShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="mx-auto grid min-h-screen max-w-7xl md:grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 text-xl font-bold text-brand-600">PlanLab</div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-sm text-slate-500">Dashboard docente</p>
          <ThemeToggle />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  </div>
);
