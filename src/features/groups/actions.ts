"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { normalizeEducationLevel } from "@/lib/constants/education";
import {
  groupSchema,
  importStudentsInputSchema,
  studentSchema,
  type GroupInput,
  type ImportStudentsInput,
  type StudentInput
} from "@/lib/validations/groups";

export type ActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  summary?: {
    inserted: number;
    omittedDuplicates: number;
    processed: number;
  };
};

const validationErrorResult = (fieldErrors: Record<string, string[] | undefined>): ActionResult => ({
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

const buildGroupPayload = (values: GroupInput, userId: string) => ({
  user_id: userId,
  name: values.name,
  level: normalizeEducationLevel(values.level) ?? values.level,
  subject: values.subject,
  period: values.period?.trim() ? values.period.trim() : null
});

const buildStudentPayload = (values: StudentInput, userId: string) => ({
  user_id: userId,
  group_id: values.groupId,
  full_name: values.fullName,
  student_code: values.studentCode?.trim() ? values.studentCode.trim() : null,
  status: values.status,
  notes: values.notes?.trim() ? values.notes.trim() : null
});

const validateGroupOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], groupId: string, userId: string) => {
  const { data: group, error } = await supabase.from("groups").select("id").eq("id", groupId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando grupo:", error);
    throw new Error(`No pudimos validar el grupo seleccionado: ${error.message}`);
  }

  if (!group) {
    throw new Error("No encontramos el grupo seleccionado dentro de tu cuenta.");
  }
};

const validateStudentOwnership = async (supabase: Awaited<ReturnType<typeof getAuthenticatedSupabase>>["supabase"], studentId: string, userId: string) => {
  const { data: student, error } = await supabase.from("students").select("id").eq("id", studentId).eq("user_id", userId).maybeSingle();

  if (error) {
    console.error("Error validando estudiante:", error);
    throw new Error(`No pudimos validar el estudiante seleccionado: ${error.message}`);
  }

  if (!student) {
    throw new Error("No encontramos el estudiante seleccionado dentro de tu cuenta.");
  }
};

export const createGroupAction = async (input: GroupInput): Promise<ActionResult> => {
  const parsed = groupSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    const { error } = await supabase.from("groups").insert(buildGroupPayload(parsed.data, user.id));

    if (error) {
      console.error("Error real creando grupo:", error);
      return {
        success: false,
        message: `No pudimos crear el grupo: ${error.message}`
      };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Grupo creado correctamente." };
  } catch (error) {
    console.error("Excepción creando grupo:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos crear el grupo."
    };
  }
};

export const updateGroupAction = async (input: GroupInput): Promise<ActionResult> => {
  const parsed = groupSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  if (!parsed.data.id) {
    return { success: false, message: "No encontramos el grupo que intentas editar." };
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, parsed.data.id, user.id);

    const { error } = await supabase
      .from("groups")
      .update({
        name: parsed.data.name,
        level: normalizeEducationLevel(parsed.data.level) ?? parsed.data.level,
        subject: parsed.data.subject,
        period: parsed.data.period?.trim() ? parsed.data.period.trim() : null
      })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error real actualizando grupo:", error);
      return {
        success: false,
        message: `No pudimos actualizar el grupo: ${error.message}`
      };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Grupo actualizado correctamente." };
  } catch (error) {
    console.error("Excepción actualizando grupo:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos actualizar el grupo."
    };
  }
};

export const deleteGroupAction = async (groupId: string): Promise<ActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, groupId, user.id);

    const { error } = await supabase.from("groups").delete().eq("id", groupId).eq("user_id", user.id);

    if (error) {
      console.error("Error real eliminando grupo:", error);
      return { success: false, message: `No pudimos eliminar el grupo: ${error.message}` };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Grupo eliminado correctamente." };
  } catch (error) {
    console.error("Excepción eliminando grupo:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos eliminar el grupo."
    };
  }
};

export const createStudentAction = async (input: StudentInput): Promise<ActionResult> => {
  const parsed = studentSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    const { error } = await supabase.from("students").insert(buildStudentPayload(parsed.data, user.id));

    if (error) {
      console.error("Error real creando estudiante:", error);
      return { success: false, message: `No pudimos guardar el estudiante: ${error.message}` };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Estudiante agregado correctamente." };
  } catch (error) {
    console.error("Excepción creando estudiante:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos guardar el estudiante."
    };
  }
};

export const updateStudentAction = async (input: StudentInput): Promise<ActionResult> => {
  const parsed = studentSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  if (!parsed.data.id) {
    return { success: false, message: "No encontramos el estudiante que intentas editar." };
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateStudentOwnership(supabase, parsed.data.id, user.id);
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    const { error } = await supabase
      .from("students")
      .update({
        group_id: parsed.data.groupId,
        full_name: parsed.data.fullName,
        student_code: parsed.data.studentCode?.trim() ? parsed.data.studentCode.trim() : null,
        status: parsed.data.status,
        notes: parsed.data.notes?.trim() ? parsed.data.notes.trim() : null
      })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error real actualizando estudiante:", error);
      return { success: false, message: `No pudimos actualizar el estudiante: ${error.message}` };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Estudiante actualizado correctamente." };
  } catch (error) {
    console.error("Excepción actualizando estudiante:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos actualizar el estudiante."
    };
  }
};

export const deleteStudentAction = async (studentId: string): Promise<ActionResult> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateStudentOwnership(supabase, studentId, user.id);

    const { error } = await supabase.from("students").delete().eq("id", studentId).eq("user_id", user.id);

    if (error) {
      console.error("Error real eliminando estudiante:", error);
      return { success: false, message: `No pudimos eliminar el estudiante: ${error.message}` };
    }

    revalidatePath("/grupos");
    return { success: true, message: "Estudiante eliminado correctamente." };
  } catch (error) {
    console.error("Excepción eliminando estudiante:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos eliminar el estudiante."
    };
  }
};

export const importStudentsAction = async (input: ImportStudentsInput): Promise<ActionResult> => {
  const parsed = importStudentsInputSchema.safeParse(input);

  if (!parsed.success) {
    return validationErrorResult(parsed.error.flatten().fieldErrors);
  }

  try {
    const { supabase, user } = await getAuthenticatedSupabase();
    await validateGroupOwnership(supabase, parsed.data.groupId, user.id);

    const normalizedIncomingCodes = parsed.data.students
      .map((student) => student.studentCode?.trim() ?? null)
      .filter((code): code is string => Boolean(code));

    const uniqueIncomingCodes = Array.from(new Set(normalizedIncomingCodes));
    let existingCodes = new Set<string>();

    if (uniqueIncomingCodes.length > 0) {
      const { data: existingStudents, error: existingError } = await supabase
        .from("students")
        .select("student_code")
        .eq("user_id", user.id)
        .eq("group_id", parsed.data.groupId)
        .in("student_code", uniqueIncomingCodes);

      if (existingError) {
        console.error("Error real consultando duplicados:", existingError);
        return {
          success: false,
          message: `No pudimos validar duplicados antes de importar: ${existingError.message}`
        };
      }

      existingCodes = new Set((existingStudents ?? []).map((student) => student.student_code).filter((code): code is string => Boolean(code)));
    }

    const seenCodesInFile = new Set<string>();
    let omittedDuplicates = 0;

    // Yo filtro duplicados por código dentro del mismo archivo y contra el grupo actual.
    const rowsToInsert = parsed.data.students.flatMap((student) => {
      const normalizedCode = student.studentCode?.trim() ?? null;

      if (normalizedCode) {
        if (existingCodes.has(normalizedCode) || seenCodesInFile.has(normalizedCode)) {
          omittedDuplicates += 1;
          return [];
        }

        seenCodesInFile.add(normalizedCode);
      }

      return [
        {
          user_id: user.id,
          group_id: parsed.data.groupId,
          full_name: student.fullName,
          student_code: normalizedCode,
          status: student.status,
          notes: student.notes?.trim() ? student.notes.trim() : null
        }
      ];
    });

    if (rowsToInsert.length === 0) {
      return {
        success: false,
        message: "No encontramos estudiantes nuevos para importar. Todos fueron omitidos por duplicado o el archivo no tenía filas válidas.",
        summary: {
          inserted: 0,
          omittedDuplicates,
          processed: parsed.data.students.length
        }
      };
    }

    const { error } = await supabase.from("students").insert(rowsToInsert);

    if (error) {
      console.error("Error real importando estudiantes:", error);
      return {
        success: false,
        message: `No pudimos importar los estudiantes: ${error.message}`
      };
    }

    revalidatePath("/grupos");
    return {
      success: true,
      message: omittedDuplicates > 0 ? "Importación completada con algunos duplicados omitidos." : "Importación completada correctamente.",
      summary: {
        inserted: rowsToInsert.length,
        omittedDuplicates,
        processed: parsed.data.students.length
      }
    };
  } catch (error) {
    console.error("Excepción importando estudiantes:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No pudimos importar los estudiantes."
    };
  }
};
