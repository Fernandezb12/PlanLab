"use client";

import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  type: "activity_pending" | "group_alert" | "student_alert" | "report_created" | "plan_ai" | "document_exported" | "review_reminder";
  title: string;
  message: string;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

const typeStyles: Record<NotificationItem["type"], string> = {
  activity_pending: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/70 dark:text-amber-200",
  group_alert: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/70 dark:text-rose-200",
  student_alert: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-950/70 dark:text-orange-200",
  report_created: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-950/70 dark:text-blue-200",
  plan_ai: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-950/70 dark:text-violet-200",
  document_exported: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/70 dark:text-emerald-200",
  review_reminder: "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Hace un momento";
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  return `Hace ${diffDays} días`;
};

export const NotificationsPopover = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [persistenceEnabled, setPersistenceEnabled] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/notifications");
      const payload = (await response.json()) as {
        notifications?: NotificationItem[];
        unreadCount?: number;
        message?: string;
        persistenceEnabled?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.message || "No fue posible cargar las notificaciones.");
      }

      setNotifications(payload.notifications ?? []);
      setUnreadCount(payload.unreadCount ?? 0);
      setPersistenceEnabled(payload.persistenceEnabled ?? true);
    } catch (error) {
      console.error("Error real cargando notificaciones:", error);
      setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar las notificaciones.");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  const markAsRead = async (notificationId: string) => {
    if (!persistenceEnabled) {
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      });

      if (!response.ok) {
        throw new Error("No fue posible actualizar la notificación.");
      }

      setNotifications((current) => current.map((notification) => (notification.id === notificationId ? { ...notification, is_read: true } : notification)));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Error real marcando notificación como leída:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!persistenceEnabled) {
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });

      if (!response.ok) {
        throw new Error("No fue posible actualizar las notificaciones.");
      }

      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error real marcando todas las notificaciones como leídas:", error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative shrink-0 rounded-2xl border border-slate-300/90 bg-white/96 p-2.5 text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-200 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900"
        aria-label="Abrir notificaciones"
      >
        <Bell className="h-4 w-4" />
        {hasUnread ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-3 top-[4.75rem] z-[110] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_36px_90px_-38px_rgba(15,23,42,0.38)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_42px_90px_-42px_rgba(0,0,0,0.82)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[380px] sm:rounded-[24px]">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 px-3.5 py-3 dark:border-slate-800/90 sm:items-center sm:px-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {persistenceEnabled
                  ? "Revisa novedades, alertas y tareas pendientes del sistema."
                  : "Vista temporal basada en el estado actual del sistema."}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!hasUnread || !persistenceEnabled}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todo
            </button>
          </div>

          <div className="max-h-[min(56vh,24rem)] overflow-y-auto px-2 py-2 sm:max-h-[420px]">
            {isLoading ? (
              <div className="grid min-h-[150px] place-items-center sm:min-h-[180px]">
                <LoaderCircle className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-center dark:border-amber-500/30 dark:bg-amber-500/10 sm:py-6">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">No fue posible actualizar este panel</p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">{errorMessage}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-900 sm:py-6">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">No hay notificaciones por ahora</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cuando surjan recordatorios o alertas del sistema, aparecerán en este espacio.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const content = (
                    <div
                      className={`rounded-2xl border px-3 py-2.5 transition hover:bg-slate-100 dark:hover:bg-white/[0.06] sm:py-3 ${
                        notification.is_read ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" : typeStyles[notification.type]
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{notification.title}</p>
                          <p className="mt-1 text-xs leading-5 opacity-90">{notification.message}</p>
                          <p className="mt-2 text-[11px] font-medium opacity-70">{formatRelativeDate(notification.created_at)}</p>
                        </div>
                        {!notification.is_read && persistenceEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="shrink-0 rounded-lg border border-current/20 bg-white/70 px-2 py-1 text-[11px] font-medium transition hover:bg-white dark:bg-slate-950/40 dark:hover:bg-slate-900"
                          >
                            Leída
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );

                  return notification.href ? (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
