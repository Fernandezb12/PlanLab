"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { planSchema, type PlanInput } from "@/lib/validations/plans";

export type PlanActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const validationErrorResult = (fieldErrors: Record<string, string[] | undefined>): PlanActionResult => ({
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
    console.error("Error validando grupo para plan:", error);
    throw new Error(`No pudimos validar el grupo seleccionado: ${error.message}`);
  }

  if (!group) {
    throw new Error("No encontramos el grupo seleccionado dentro de tu cuenta.");
  }
};

const validatePlanOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], planId: string, userId: string) => {
  const { data: plan, error } = await supabase.from("lesson_plans").select("id").eq("id", planId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando plan:", error);
    throw new Error(`No pudimos validar el plan seleccionado: ${error.message}`);
  }

  if (!plan) {
    throw new Error("No encontramos el plan seleccionado dentro de tu cuenta.");
  }
};

const buildPlanPayload = (values: PlanInput, userId: string) => ({
  user_id: userId,
  group_id: values.groupId,
  title: values.title,
  subject: values.subject,
  topic: values.topic,
  duration_minutes: values.durationMinutes,
  objective: values.objective,
  resources: values.resources?.trim() ? values.resources.trim() : null,
  evaluation_type: values.evaluationType,
  status: values.status,
  // Yo guardo una estructura simple para dejar el campo listo sin meter IA todavía.
  plan_json: {
    title: values.title,
    subject: values.subject,
    topic: values.topic,
    duration_minutes: values.durationMinutes,
    objective: values.objective,
    resources: values.resources?.trim() ? values.resources.trim() : null,
    evaluation_type: values.evaluationType,
    status: values.status
  }
});

export const createPlanAction = async (input: PlanInput): Promise<PlanActionResult> => {
  const parsed = planSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    const { error } = await supabase.from("lesson_plans").insert(buildPlanPayload(parsed.data, user.id));

    if (error) {
      console.error("Error real creando plan:", error);
      return {
        success: false,
        message: `No pudimos crear el plan: ${error.message}`
      };
    }

    revalidatePath("/planes");
    return { success: true, message: "Plan creado correctamente." };
  } catch (error) {
    console.error("Excepción creando plan:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos crear el plan."
    };
  }
};

export const updatePlanAction = async (input: PlanInput): Promise<PlanActionResult> => {
  const parsed = planSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  if (!parsed.data.id) {
    return { success: false, message: "No encontramos el plan que intentas editar." };
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validatePlanOwnership(supabase, parsed.data.id, user.id);
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    const { error } = await supabase
      .from("lesson_plans")
      .update({
        group_id: parsed.data.groupId,
        title: parsed.data.title,
        subject: parsed.data.subject,
        topic: parsed.data.topic,
        duration_minutes: parsed.data.durationMinutes,
        objective: parsed.data.objective,
        resources: parsed.data.resources?.trim() ? parsed.data.resources.trim() : null,
        evaluation_type: parsed.data.evaluationType,
        status: parsed.data.status,
        plan_json: {
          title: parsed.data.title,
          subject: parsed.data.subject,
          topic: parsed.data.topic,
          duration_minutes: parsed.data.durationMinutes,
          objective: parsed.data.objective,
          resources: parsed.data.resources?.trim() ? parsed.data.resources.trim() : null,
          evaluation_type: parsed.data.evaluationType,
          status: parsed.data.status
        }
      })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error real actualizando plan:", error);
      return {
        success: false,
        message: `No pudimos actualizar el plan: ${error.message}`
      };
    }

    revalidatePath("/planes");
    return { success: true, message: "Plan actualizado correctamente." };
  } catch (error) {
    console.error("Excepción actualizando plan:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos actualizar el plan."
    };
  }
};

export const duplicatePlanAction = async (planId: string): Promise<PlanActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const { data: originalPlan, error: fetchError } = await supabase
      .from("lesson_plans")
      .select("group_id,title,subject,topic,duration_minutes,objective,resources,evaluation_type,plan_json,status")
      .eq("id", planId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error real leyendo plan a duplicar:", fetchError);
      return {
        success: false,
        message: `No pudimos leer el plan a duplicar: ${fetchError.message}`
      };
    }

    if (!originalPlan) {
      return {
        success: false,
        message: "No encontramos el plan que intentas duplicar dentro de tu cuenta."
      };
    }

    if (originalPlan.group_id) {
      await validateGroupOwnership(supabase, originalPlan.group_id, user.id);
    }

    const { error } = await supabase.from("lesson_plans").insert({
      user_id: user.id,
      group_id: originalPlan.group_id,
      title: `Copia de ${originalPlan.title}`,
      subject: originalPlan.subject,
      topic: originalPlan.topic,
      duration_minutes: originalPlan.duration_minutes,
      objective: originalPlan.objective,
      resources: originalPlan.resources,
      evaluation_type: originalPlan.evaluation_type,
      plan_json: originalPlan.plan_json,
      status: originalPlan.status
    });

    if (error) {
      console.error("Error real duplicando plan:", error);
      return {
        success: false,
        message: `No pudimos duplicar el plan: ${error.message}`
      };
    }

    revalidatePath("/planes");
    return { success: true, message: "Plan duplicado correctamente." };
  } catch (error) {
    console.error("Excepción duplicando plan:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos duplicar el plan."
    };
  }
};

export const deletePlanAction = async (planId: string): Promise<PlanActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validatePlanOwnership(supabase, planId, user.id);

    const { error } = await supabase.from("lesson_plans").delete().eq("id", planId).eq("user_id", user.id);

    if (error) {
      console.error("Error real eliminando plan:", error);
      return { success: false, message: `No pudimos eliminar el plan: ${error.message}` };
    }

    revalidatePath("/planes");
    return { success: true, message: "Plan eliminado correctamente." };
  } catch (error) {
    console.error("Excepción eliminando plan:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos eliminar el plan."
    };
  }
};
