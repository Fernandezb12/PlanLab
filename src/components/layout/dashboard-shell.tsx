"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, GraduationCap, LayoutDashboard, ListChecks, Menu, Settings2, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { PlanLabBrand } from "@/components/branding/planlab-brand";
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#070915] dark:text-slate-100">
      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Cerrar navegación"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-[#0d1120] dark:shadow-[0_34px_90px_-34px_rgba(0,0,0,0.78)]">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PlanLabBrand kind="full" priority className="max-w-[168px]" />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
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
        </div>
      ) : null}

      <div className="mx-auto grid min-h-screen max-w-[1600px] md:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200/90 bg-white/88 p-5 backdrop-blur-md dark:border-white/10 dark:bg-[#0d1120] md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
          <div className="mb-9">
            <PlanLabBrand kind="full" priority className="max-w-[188px]" />
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
          <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/88 px-4 py-3.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0a0f1f]/82 sm:px-5 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300/90 bg-white/96 text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900 md:hidden"
                  aria-label="Abrir navegación"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="relative h-8 w-8 shrink-0 md:hidden">
                  <PlanLabBrand kind="icon" className="h-full w-full" />
                </div>
                <p className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{currentTitle}</p>
              </div>

              <div className="ml-auto flex w-auto items-center justify-end gap-2 sm:gap-2.5 md:gap-3">
                <GlobalSearch />
                <ThemeToggle />
                <NotificationsPopover />
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="shrink-0 rounded-2xl border border-slate-300/90 bg-white/96 p-1 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    aria-label="Abrir menú de perfil"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">{initials}</div>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="absolute right-0 top-12 z-[90] w-[min(14rem,calc(100vw-1rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_36px_90px_-38px_rgba(15,23,42,0.38)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_42px_90px_-42px_rgba(0,0,0,0.82)]">
                      <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Mi cuenta</p>
                      <div className="px-3 pb-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{userProfile.fullName ?? "Docente PlanLab"}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userProfile.email ?? "Sin correo"}</p>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href="/perfil#configuracion"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
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
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/60"
                      >
                        {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
