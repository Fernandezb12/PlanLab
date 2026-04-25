import { NextResponse } from "next/server";

import { buildReportWordFilename } from "@/lib/pdf/filenames";
import { buildReportExportData } from "@/lib/reports/export";
import { createClient } from "@/lib/supabase/server";
import { reportTypeLabels } from "@/lib/validations/reports";
import { buildReportWordBuffer } from "@/lib/word/report-document";

export const runtime = "nodejs";

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
        .select("id,group_id,activity_id,report_type,groups(name,level),activities(title)")
        .eq("id", reportId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    ]);

    if (reportError) {
      console.error("Error real consultando reporte para Word:", reportError);
      return NextResponse.json({ message: `No fue posible cargar el reporte: ${reportError.message}` }, { status: 500 });
    }

    if (profileError) {
      console.error("Error real consultando perfil para Word del reporte:", profileError);
      return NextResponse.json({ message: `No fue posible cargar el perfil docente: ${profileError.message}` }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ message: "No se encontró el reporte solicitado dentro de tu cuenta." }, { status: 404 });
    }

    const [group, activity] = [Array.isArray(report.groups) ? report.groups[0] : report.groups, Array.isArray(report.activities) ? report.activities[0] : report.activities];

    const [{ data: activities }, { data: students }, { data: records }] = await Promise.all([
      supabase.from("activities").select("id,title,group_id").eq("group_id", report.group_id).eq("user_id", user.id),
      supabase.from("students").select("id,full_name,student_code").eq("group_id", report.group_id).eq("user_id", user.id).order("full_name"),
      report.activity_id
        ? supabase.from("activity_records").select("id,student_id,attended,result_score,observation,activity_id").eq("activity_id", report.activity_id).eq("user_id", user.id)
        : supabase
            .from("activity_records")
            .select("id,student_id,attended,result_score,observation,activity_id,activities!inner(group_id)")
            .eq("user_id", user.id)
            .eq("activities.group_id", report.group_id)
    ]);

    const reportData = buildReportExportData({
      teacherName: profile?.full_name ?? "Docente",
      generatedAt: new Date().toISOString(),
      reportType: report.report_type,
      reportTypeLabel: reportTypeLabels[report.report_type as keyof typeof reportTypeLabels] ?? report.report_type,
      groupName: group?.name ?? "Grupo",
      educationLevel: group?.level ?? null,
      activityTitle: activity?.title ?? null,
      students: students ?? [],
      records: (records ?? []).map((record) => ({
        attended: record.attended,
        result_score: record.result_score,
        observation: record.observation,
        student_id: record.student_id,
        activity_id: record.activity_id
      })),
      activitiesAnalyzed: report.activity_id ? 1 : activities?.length ?? 0
    });

    const buffer = await buildReportWordBuffer({ data: reportData });
    const filename = buildReportWordFilename(report.report_type, group?.name ?? "grupo", activity?.title ?? null);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Excepción generando Word de reporte:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible exportar el documento editable en este intento."
      },
      { status: 500 }
    );
  }
}
