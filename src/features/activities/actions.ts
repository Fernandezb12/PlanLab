"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { activitySchema, type ActivityInput } from "@/lib/validations/activities";

export type ActivityActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const validationErrorResult = (fieldErrors: Record<string, string[] | undefined>): ActivityActionResult => ({
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
    console.error("Error validando grupo para actividad:", error);
    throw new Error(`No pudimos validar el grupo seleccionado: ${error.message}`);
  }

  if (!group) {
    throw new Error("No encontramos el grupo seleccionado dentro de tu cuenta.");
  }
};

const validatePlanOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], planId: string, userId: string) => {
  const { data: plan, error } = await supabase.from("lesson_plans").select("id,group_id,title").eq("id", planId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando plan para actividad:", error);
    throw new Error(`No pudimos validar el plan seleccionado: ${error.message}`);
  }

  if (!plan) {
    throw new Error("No encontramos el plan seleccionado dentro de tu cuenta.");
  }

  return plan;
};

const validateActivityOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], activityId: string, userId: string) => {
  const { data: activity, error } = await supabase.from("activities").select("id").eq("id", activityId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando actividad:", error);
    throw new Error(`No pudimos validar la actividad seleccionada: ${error.message}`);
  }

  if (!activity) {
    throw new Error("No encontramos la actividad seleccionada dentro de tu cuenta.");
  }
};

const buildActivityPayload = (values: ActivityInput, userId: string) => ({
  user_id: userId,
  lesson_plan_id: values.lessonPlanId,
  group_id: values.groupId,
  title: values.title,
  activity_date: values.activityDate,
  status: values.status,
  notes: values.notes?.trim() ? values.notes.trim() : null
});

export const createActivityAction = async (input: ActivityInput): Promise<ActivityActionResult> => {
  const parsed = activitySchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const plan = await validatePlanOwnership(supabase, parsed.data.lessonPlanId, user.id);
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    if (plan.group_id && plan.group_id !== parsed.data.groupId) {
      return {
        success: false,
        message: "El grupo seleccionado no coincide con el plan elegido."
      };
    }

    const { error } = await supabase.from("activities").insert(buildActivityPayload(parsed.data, user.id));

    if (error) {
      console.error("Error real creando actividad:", error);
      return {
        success: false,
        message: `No pudimos crear la actividad: ${error.message}`
      };
    }

    revalidatePath("/actividades");
    return { success: true, message: "Actividad creada correctamente." };
  } catch (error) {
    console.error("Excepción creando actividad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos crear la actividad."
    };
  }
};

export const updateActivityAction = async (input: ActivityInput): Promise<ActivityActionResult> => {
  const parsed = activitySchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  if (!parsed.data.id) {
    return { success: false, message: "No encontramos la actividad que intentas editar." };
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateActivityOwnership(supabase, parsed.data.id, user.id);
    const plan = await validatePlanOwnership(supabase, parsed.data.lessonPlanId, user.id);
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    if (plan.group_id && plan.group_id !== parsed.data.groupId) {
      return {
        success: false,
        message: "El grupo seleccionado no coincide con el plan elegido."
      };
    }

    const { error } = await supabase
      .from("activities")
      .update({
        lesson_plan_id: parsed.data.lessonPlanId,
        group_id: parsed.data.groupId,
        title: parsed.data.title,
        activity_date: parsed.data.activityDate,
        status: parsed.data.status,
        notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null
      })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error real actualizando actividad:", error);
      return {
        success: false,
        message: `No pudimos actualizar la actividad: ${error.message}`
      };
    }

    revalidatePath("/actividades");
    return { success: true, message: "Actividad actualizada correctamente." };
  } catch (error) {
    console.error("Excepción actualizando actividad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos actualizar la actividad."
    };
  }
};

export const deleteActivityAction = async (activityId: string): Promise<ActivityActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateActivityOwnership(supabase, activityId, user.id);

    const { error } = await supabase.from("activities").delete().eq("id", activityId).eq("user_id", user.id);

    if (error) {
      console.error("Error real eliminando actividad:", error);
      return {
        success: false,
        message: `No pudimos eliminar la actividad: ${error.message}`
      };
    }

    revalidatePath("/actividades");
    return { success: true, message: "Actividad eliminada correctamente." };
  } catch (error) {
    console.error("Excepción eliminando actividad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos eliminar la actividad."
    };
  }
};
