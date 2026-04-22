import { NextResponse } from "next/server";
import { createElement } from "react";

import { createNotification } from "@/lib/notifications/server";
import { ReportPdfDocument } from "@/lib/pdf/documents";
import { buildReportPdfPath } from "@/lib/pdf/filenames";
import { renderPdfToBuffer } from "@/lib/pdf/render";
import { uploadPdfToStorage } from "@/lib/pdf/storage";
import { createClient } from "@/lib/supabase/server";
import { reportTypeLabels } from "@/lib/validations/reports";

export const runtime = "nodejs";

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

export async function POST(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const [{ data: report, error: reportError }, { data: profile, error: profileError }] = await Promise.all([
      supabase
        .from("reports")
        .select("id,group_id,activity_id,report_type,file_url,groups(name,level),activities(title)")
        .eq("id", reportId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    ]);

    if (reportError) {
      console.error("Error real consultando reporte para PDF:", reportError);
      return NextResponse.json({ message: `No fue posible cargar el reporte: ${reportError.message}` }, { status: 500 });
    }

    if (profileError) {
      console.error("Error real consultando perfil para PDF:", profileError);
      return NextResponse.json({ message: `No fue posible cargar el perfil docente: ${profileError.message}` }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ message: "No se encontró el reporte solicitado dentro de tu cuenta." }, { status: 404 });
    }

    const [group, activity] = [Array.isArray(report.groups) ? report.groups[0] : report.groups, Array.isArray(report.activities) ? report.activities[0] : report.activities];

    const [{ data: activities }, { data: records }] = await Promise.all([
      supabase.from("activities").select("id,title,group_id").eq("group_id", report.group_id),
      report.activity_id
        ? supabase.from("activity_records").select("id,student_id,attended,result_score,observation").eq("activity_id", report.activity_id)
        : supabase
            .from("activity_records")
            .select("id,student_id,attended,result_score,observation,activities!inner(group_id)")
            .eq("activities.group_id", report.group_id)
    ]);

    const activityRecords = (records ?? []).map((record) => ({
      attended: record.attended,
      result_score: record.result_score,
      observation: record.observation,
      student_id: record.student_id
    }));

    const scores = activityRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const averageScore = average(scores);
    const attendanceAverage = activityRecords.length
      ? (activityRecords.filter((record) => record.attended).length / activityRecords.length) * 100
      : null;
    const alerts = [
      ...(averageScore !== null && averageScore < 60 ? ["El promedio general del grupo requiere seguimiento pedagógico prioritario."] : []),
      ...(attendanceAverage !== null && attendanceAverage < 75 ? ["La asistencia promedio refleja riesgo de continuidad o participación."] : []),
      ...(((activities ?? []).filter((currentActivity) => !report.activity_id && !(records ?? []).some((record) => "activities" in record && (record.activities as { group_id: string }).group_id === currentActivity.group_id)).length > 0)
        ? ["Existen actividades del grupo sin consolidación completa de resultados."]
        : [])
    ].slice(0, 4);

    const observationTexts = activityRecords
      .map((record) => record.observation?.trim())
      .filter((observation): observation is string => Boolean(observation))
      .slice(0, 5);

    const executiveSummary =
      averageScore === null && attendanceAverage === null
        ? "Aún no hay registros suficientes para consolidar un análisis cuantitativo completo. Este reporte deja trazabilidad del corte pedagógico actual."
        : `El reporte ${reportTypeLabels[report.report_type as keyof typeof reportTypeLabels] ?? report.report_type.toLowerCase()} resume el comportamiento académico del grupo ${
            group?.name ?? ""
          } con una asistencia promedio de ${attendanceAverage === null ? "sin datos" : `${Math.round(attendanceAverage)}%`} y un promedio general de ${
            averageScore === null ? "sin datos" : averageScore.toFixed(1)
          }.`;

    const document = createElement(ReportPdfDocument, {
      data: {
        teacherName: profile?.full_name ?? "Docente",
        generatedAt: new Date().toISOString(),
        reportType: reportTypeLabels[report.report_type as keyof typeof reportTypeLabels] ?? report.report_type,
        groupName: group?.name ?? "Grupo",
        educationLevel: group?.level ?? null,
        activityTitle: activity?.title ?? null,
        averageScore,
        attendanceAverage,
        alerts,
        observations: observationTexts,
        executiveSummary
      }
    });

    const buffer = await renderPdfToBuffer(document);
    const path = buildReportPdfPath(report.report_type, group?.name ?? "grupo", activity?.title ?? null);
    const upload = await uploadPdfToStorage({ supabase, path, buffer });

    const { error: updateError } = await supabase.from("reports").update({ file_url: upload.path }).eq("id", report.id).eq("user_id", user.id);

    if (updateError) {
      console.error("Error real actualizando file_url del reporte:", updateError);
      return NextResponse.json({ message: `Se generó el documento, pero no fue posible registrar la ruta: ${updateError.message}` }, { status: 500 });
    }

    await createNotification(supabase, {
      userId: user.id,
      type: "document_exported",
      title: "Reporte exportado",
      message: `El reporte ${reportTypeLabels[report.report_type as keyof typeof reportTypeLabels] ?? report.report_type} ya está disponible en PDF.`,
      href: "/reportes"
    });

    return NextResponse.json({
      message: "Reporte exportado correctamente.",
      signedUrl: upload.signedUrl,
      path: upload.path
    });
  } catch (error) {
    console.error("Excepción generando PDF de reporte:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible generar el documento en este intento. Intenta nuevamente."
      },
      { status: 500 }
    );
  }
}
