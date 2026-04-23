"use server";

import { revalidatePath } from "next/cache";

import { createNotification } from "@/lib/notifications/server";
import { createClient } from "@/lib/supabase/server";
import { createReportSchema, type CreateReportInput } from "@/lib/validations/reports";
import { reportTypeLabels } from "@/lib/validations/reports";

export type ReportActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const validationErrorResult = (fieldErrors: Record<string, string[] | undefined>): ReportActionResult => ({
  success: false,
  message: "Revisa los campos marcados e inténtalo de nuevo.",
  fieldErrors
});

const getAuthenticatedSupabase = async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  }

  return { supabase, user };
};

const validateGroupOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], groupId: string, userId: string) => {
  const { data: group, error } = await supabase.from("groups").select("id").eq("id", groupId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando grupo para reporte:", error);
    throw new Error(`No pudimos validar el grupo seleccionado: ${error.message}`);
  }

  if (!group) {
    throw new Error("No encontramos el grupo seleccionado dentro de tu cuenta.");
  }
};

const validateActivityOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], activityId: string, groupId: string, userId: string) => {
  const { data: activity, error } = await supabase
    .from("activities")
    .select("id,group_id")
    .eq("id", activityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error validando actividad para reporte:", error);
    throw new Error(`No pudimos validar la actividad seleccionada: ${error.message}`);
  }

  if (!activity) {
    throw new Error("No encontramos la actividad seleccionada dentro de tu cuenta.");
  }

  if (activity.group_id && activity.group_id !== groupId) {
    throw new Error("La actividad seleccionada no pertenece al grupo escogido.");
  }
};

export const createReportAction = async (input: CreateReportInput): Promise<ReportActionResult> => {
  const parsed = createReportSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    if (parsed.data.activityId) {
      await validateActivityOwnership(supabase, parsed.data.activityId, parsed.data.groupId, user.id);
    }

    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      group_id: parsed.data.groupId,
      activity_id: parsed.data.activityId || null,
      report_type: parsed.data.reportType,
      file_url: null
    });

    if (error) {
      console.error("Error real creando reporte:", error);
      return {
        success: false,
        message: `No pudimos crear el reporte: ${error.message}`
      };
    }

    await createNotification(supabase, {
      userId: user.id,
      type: "report_created",
      title: "Reporte creado",
      message: `Se creó el reporte ${reportTypeLabels[parsed.data.reportType]} para continuar la consolidación pedagógica.`,
      href: "/reportes"
    });

    revalidatePath("/reportes");
    revalidatePath("/dashboard");
    return { success: true, message: "Reporte base creado correctamente." };
  } catch (error) {
    console.error("Excepción creando reporte:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos crear el reporte."
    };
  }
};

export const deleteReportAction = async (reportId: string): Promise<ReportActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();

    const { error } = await supabase.from("reports").delete().eq("id", reportId).eq("user_id", user.id);

    if (error) {
      console.error("Error real eliminando reporte:", error);
      return {
        success: false,
        message: `No pudimos eliminar el reporte: ${error.message}`
      };
    }

    revalidatePath("/reportes");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Reporte eliminado correctamente."
    };
  } catch (error) {
    console.error("Excepción eliminando reporte:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos eliminar el reporte."
    };
  }
};
