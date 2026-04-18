"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, FileText, FolderKanban, GraduationCap, ListChecks, Search, Settings2, Users } from "lucide-react";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/planes", label: "Planes", icon: FolderKanban },
  { href: "/actividades", label: "Actividades", icon: ListChecks },
  { href: "/resultados", label: "Resultados", icon: GraduationCap },
  { href: "/reportes", label: "Reportes", icon: FileText },
  { href: "/grupos", label: "Grupos y Estudiantes", icon: Users },
  { href: "/perfil", label: "Perfil/Configuración", icon: Settings2 }
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/planes": "Planes",
  "/actividades": "Actividades",
  "/resultados": "Resultados",
  "/reportes": "Reportes",
  "/grupos": "Grupos y Estudiantes",
  "/perfil": "Perfil y Configuración"
};

export const DashboardShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const currentTitle = pageTitles[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#070915] dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white/70 p-5 backdrop-blur-md dark:border-white/10 dark:bg-[#0d1120] md:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 font-bold text-white shadow-lg shadow-violet-900/35">
              <Image src="/logo.png" alt="PlanLab" fill sizes="40px" className="object-cover" />
              <span className="relative">PL</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight">PlanLab</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tu laboratorio pedagógico inteligente</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-700 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-violet-600 dark:text-violet-300" : "text-slate-500 dark:text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/75 px-5 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0a0f1f]/75 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-2xl font-bold tracking-tight">{currentTitle}</p>

              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    placeholder="Buscar plan, estudiante o grupo..."
                    className="w-[360px] rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-white/5"
                  />
                </div>
                <ThemeToggle />
                <button className="rounded-xl border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                </button>
                <Link href="/perfil" className="rounded-full border border-slate-300 p-1 dark:border-white/15">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-900 text-xs text-white dark:bg-white dark:text-slate-900">DF</div>
                </Link>
              </div>
            </div>
          </header>

          {/* Yo dejo un contenedor consistente para todas las vistas internas. */}
          <div className="flex-1 p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
