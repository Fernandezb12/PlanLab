import { NextResponse } from "next/server";

import { isNotificationsTableMissingError, listNotifications } from "@/lib/notifications/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const { notifications, persistenceEnabled } = await listNotifications(supabase, user.id);

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.is_read).length,
      persistenceEnabled
    });
  } catch (error) {
    console.error("Excepción cargando notificaciones:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible cargar las notificaciones."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const body = (await request.json()) as { notificationId?: string; markAll?: boolean };

    const query = body.markAll
      ? supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
      : supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("id", body.notificationId);

    const { error } = await query;

    if (error) {
      if (isNotificationsTableMissingError(error)) {
        return NextResponse.json({ success: true, persistenceEnabled: false });
      }

      console.error("Error real marcando notificaciones como leídas:", error);
      return NextResponse.json({ message: `No fue posible actualizar las notificaciones: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, persistenceEnabled: true });
  } catch (error) {
    console.error("Excepción actualizando notificaciones:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible actualizar las notificaciones."
      },
      { status: 500 }
    );
  }
}
