"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, FolderKanban, GraduationCap, ListChecks, Settings2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { createClient } from "@/lib/supabase/client";
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

type DashboardShellProps = {
  children: ReactNode;
  userProfile: {
    fullName: string | null;
    email: string | null;
  };
};

export const DashboardShell = ({ children, userProfile }: DashboardShellProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle = pageTitles[pathname] ?? "Dashboard";
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const initials =
    userProfile.fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") ?? "PL";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#070915] dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200/90 bg-white/88 p-5 backdrop-blur-md dark:border-white/10 dark:bg-[#0d1120] md:block">
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
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-gradient-to-r from-violet-500/16 to-indigo-500/12 text-violet-700 shadow-sm dark:text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-violet-600 dark:text-violet-300" : "text-slate-600 dark:text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/88 px-5 py-3.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0a0f1f]/82 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{currentTitle}</p>

              <div className="flex items-center gap-2.5 md:gap-3">
                <GlobalSearch />
                <ThemeToggle />
                <NotificationsPopover />
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="rounded-2xl border border-slate-300/90 bg-white/96 p-1 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    aria-label="Abrir menú de perfil"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">{initials}</div>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="absolute right-0 top-12 w-56 rounded-2xl border border-slate-200 bg-white/98 p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
                      <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Mi cuenta</p>
                      <div className="px-3 pb-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{userProfile.fullName ?? "Docente PlanLab"}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userProfile.email ?? "Sin correo"}</p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href="/perfil#configuracion"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Configuración
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          setIsSigningOut(true);
                          const supabase = createClient();
                          await supabase.auth.signOut();
                          router.push("/auth/login");
                          router.refresh();
                          setIsSigningOut(false);
                        }}
                        disabled={isSigningOut}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
