import { NextResponse } from "next/server";
import { createElement } from "react";

import { createNotification } from "@/lib/notifications/server";
import { ResultsPdfDocument } from "@/lib/pdf/documents";
import { buildResultsPdfPath } from "@/lib/pdf/filenames";
import { renderPdfToBuffer } from "@/lib/pdf/render";
import { uploadPdfToStorage } from "@/lib/pdf/storage";
import { normalizeScoreToFive } from "@/lib/reports/status";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const activityId = searchParams.get("activityId");

    if (!groupId) {
      return NextResponse.json({ message: "Selecciona un grupo válido para exportar resultados." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const [{ data: profile, error: profileError }, { data: group, error: groupError }, { data: activity, error: activityError }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("groups").select("id,name,level").eq("id", groupId).eq("user_id", user.id).maybeSingle(),
      activityId
        ? supabase.from("activities").select("id,title,group_id").eq("id", activityId).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null, error: null })
    ]);

    if (profileError) {
      console.error("Error real consultando perfil para PDF de resultados:", profileError);
      return NextResponse.json({ message: `No fue posible cargar el perfil docente: ${profileError.message}` }, { status: 500 });
    }

    if (groupError) {
      console.error("Error real consultando grupo para PDF de resultados:", groupError);
      return NextResponse.json({ message: `No fue posible cargar el grupo: ${groupError.message}` }, { status: 500 });
    }

    if (activityError) {
      console.error("Error real consultando actividad para PDF de resultados:", activityError);
      return NextResponse.json({ message: `No fue posible cargar la actividad: ${activityError.message}` }, { status: 500 });
    }

    if (!group) {
      return NextResponse.json({ message: "No se encontró el grupo solicitado dentro de tu cuenta." }, { status: 404 });
    }

    if (activity && activity.group_id !== group.id) {
      return NextResponse.json({ message: "La actividad seleccionada no pertenece al grupo solicitado." }, { status: 400 });
    }

    const [{ data: students, error: studentsError }, { data: records, error: recordsError }] = await Promise.all([
      supabase.from("students").select("id,full_name").eq("group_id", group.id).order("full_name"),
      activityId
        ? supabase
            .from("activity_records")
            .select("id,student_id,attended,result_score,observation")
            .eq("activity_id", activityId)
        : supabase
            .from("activity_records")
            .select("id,student_id,attended,result_score,observation,activities!inner(group_id)")
            .eq("activities.group_id", group.id)
    ]);

    if (studentsError) {
      console.error("Error real consultando estudiantes para PDF de resultados:", studentsError);
      return NextResponse.json({ message: `No fue posible cargar los estudiantes: ${studentsError.message}` }, { status: 500 });
    }

    if (recordsError) {
      console.error("Error real consultando registros para PDF de resultados:", recordsError);
      return NextResponse.json({ message: `No fue posible cargar los registros: ${recordsError.message}` }, { status: 500 });
    }

    const relevantRecords = (records ?? []).map((record) => ({
      id: record.id,
      student_id: record.student_id,
      attended: record.attended,
      result_score: record.result_score,
      observation: record.observation
    }));

    const rows = (students ?? []).map((student) => {
      const studentRecords = relevantRecords.filter((record) => record.student_id === student.id);
      const latestRecord = studentRecords[studentRecords.length - 1];

      return {
        id: student.id,
        studentName: student.full_name,
        attended: latestRecord?.attended ?? false,
        resultScore: normalizeScoreToFive(latestRecord?.result_score),
        observation: latestRecord?.observation ?? null
      };
    });

    const scores = relevantRecords
      .map((record) => normalizeScoreToFive(record.result_score))
      .filter((score): score is number => typeof score === "number");
    const averageScore = average(scores);
    const attendanceAverage = relevantRecords.length
      ? (relevantRecords.filter((record) => record.attended).length / relevantRecords.length) * 100
      : null;

    const alerts = [
      ...(averageScore !== null && averageScore < 3 ? ["El promedio del grupo requiere acciones de refuerzo y seguimiento."] : []),
      ...(attendanceAverage !== null && attendanceAverage < 80 ? ["La asistencia promedio refleja riesgo de continuidad en el proceso."] : []),
      ...(rows.some((row) => !row.attended) ? ["Existen estudiantes con inasistencia registrada en el corte seleccionado."] : [])
    ].slice(0, 4);

    const document = createElement(ResultsPdfDocument, {
      data: {
        teacherName: profile?.full_name ?? "Docente",
        generatedAt: new Date().toISOString(),
        groupName: group.name,
        educationLevel: group.level,
        activityTitle: activity?.title ?? null,
        averageScore,
        attendanceAverage,
        alerts,
        rows
      }
    });

    const buffer = await renderPdfToBuffer(document);
    const path = buildResultsPdfPath(group.name, activity?.title ?? null);
    const upload = await uploadPdfToStorage({ supabase, path, buffer });

    await createNotification(supabase, {
      userId: user.id,
      type: "document_exported",
      title: "Resultados exportados",
      message: `Los resultados de ${group.name} ya están disponibles en PDF.`,
      href: "/resultados"
    });

    return NextResponse.json({
      message: "Resultados exportados correctamente.",
      signedUrl: upload.signedUrl,
      path: upload.path
    });
  } catch (error) {
    console.error("Excepción generando PDF de resultados:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible generar el documento en este intento. Intenta nuevamente."
      },
      { status: 500 }
    );
  }
}
