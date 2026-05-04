"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  activitySchema,
  activityScoreRangeMessage,
  saveActivityRecordsSchema,
  type ActivityInput,
  type SaveActivityRecordsInput
} from "@/lib/validations/activities";

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

export const saveActivityRecordsAction = async (input: SaveActivityRecordsInput): Promise<ActivityActionResult> => {
  const parsed = saveActivityRecordsSchema.safeParse(input);

  if (!parsed.success) {
    const hasScoreError = parsed.error.issues.some((issue) => issue.path.includes("resultScore"));

    if (hasScoreError) {
      return {
        success: false,
        message: activityScoreRangeMessage,
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const activity = await supabase
      .from("activities")
      .select("id,group_id")
      .eq("id", parsed.data.activityId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (activity.error) {
      console.error("Error real leyendo actividad para registros:", activity.error);
      return {
        success: false,
        message: `No pudimos validar la actividad: ${activity.error.message}`
      };
    }

    if (!activity.data) {
      return {
        success: false,
        message: "No encontramos la actividad seleccionada dentro de tu cuenta."
      };
    }

    if (!activity.data.group_id) {
      return {
        success: false,
        message: "La actividad no tiene un grupo asociado para registrar resultados."
      };
    }

    const studentIds = Array.from(new Set(parsed.data.records.map((record) => record.studentId)));
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .eq("group_id", activity.data.group_id)
      .in("id", studentIds);

    if (studentsError) {
      console.error("Error real validando estudiantes para registros:", studentsError);
      return {
        success: false,
        message: `No pudimos validar los estudiantes de la actividad: ${studentsError.message}`
      };
    }

    if ((students ?? []).length !== studentIds.length) {
      return {
        success: false,
        message: "Encontramos estudiantes que no pertenecen al grupo asociado a esta actividad."
      };
    }

    const { data: existingRecords, error: existingRecordsError } = await supabase
      .from("activity_records")
      .select("id,student_id")
      .eq("user_id", user.id)
      .eq("activity_id", parsed.data.activityId)
      .in("student_id", studentIds);

    if (existingRecordsError) {
      console.error("Error real leyendo registros existentes:", existingRecordsError);
      return {
        success: false,
        message: `No pudimos leer los registros existentes: ${existingRecordsError.message}`
      };
    }

    const existingMap = new Map((existingRecords ?? []).map((record) => [record.student_id, record.id]));
    const rowsToInsert = parsed.data.records
      .filter((record) => !existingMap.has(record.studentId))
      .map((record) => ({
        user_id: user.id,
        activity_id: parsed.data.activityId,
        student_id: record.studentId,
        attended: record.attended,
        result_score: record.resultScore,
        observation: record.observation?.trim() ? record.observation.trim() : null
      }));

    const rowsToUpdate = parsed.data.records.filter((record) => existingMap.has(record.studentId));

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("activity_records").insert(rowsToInsert);

      if (insertError) {
        console.error("Error real insertando registros de actividad:", insertError);
        return {
          success: false,
          message: `No pudimos guardar los nuevos registros: ${insertError.message}`
        };
      }
    }

    if (rowsToUpdate.length > 0) {
      const updateResults = await Promise.all(
        rowsToUpdate.map((record) =>
          supabase
            .from("activity_records")
            .update({
              attended: record.attended,
              result_score: record.resultScore,
              observation: record.observation?.trim() ? record.observation.trim() : null
            })
            .eq("id", existingMap.get(record.studentId) as string)
            .eq("user_id", user.id)
        )
      );

      const updateError = updateResults.find((result) => result.error)?.error;

      if (updateError) {
        console.error("Error real actualizando registros de actividad:", updateError);
        return {
          success: false,
          message: `No pudimos actualizar algunos registros: ${updateError.message}`
        };
      }
    }

    const { error: activityUpdateError } = await supabase
      .from("activities")
      .update({ status: "completed" })
      .eq("id", parsed.data.activityId)
      .eq("user_id", user.id);

    if (activityUpdateError) {
      console.error("Error real actualizando estado de actividad tras registro:", activityUpdateError);
      return {
        success: false,
        message: `Guardamos los registros, pero no pudimos actualizar el estado de la actividad: ${activityUpdateError.message}`
      };
    }

    revalidatePath("/actividades");
    revalidatePath("/resultados");
    return { success: true, message: "Resultados guardados correctamente." };
  } catch (error) {
    console.error("Excepción guardando registros de actividad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos guardar los resultados de la actividad."
    };
  }
};
