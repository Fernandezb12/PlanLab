import { redirect } from "next/navigation";

import { DashboardPanel } from "@/features/dashboard/dashboard-panel";
import { createClient } from "@/lib/supabase/server";

const quickActions = [
  { id: "qa-1", title: "Generar plan con IA", href: "/planes?ai=1", color: "from-violet-500 to-indigo-500" },
  { id: "qa-2", title: "Programar actividad", href: "/actividades", color: "from-blue-500 to-cyan-500" },
  { id: "qa-3", title: "Registrar resultados", href: "/resultados", color: "from-emerald-500 to-teal-500" },
  { id: "qa-4", title: "Generar reporte", href: "/reportes", color: "from-slate-500 to-slate-700" }
];

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Hace menos de 1 hora";
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  return `Hace ${diffDays} días`;
};

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: profile, error: profileError },
    { count: plansCount, error: plansError },
    { data: upcomingActivities, error: upcomingActivitiesError },
    { data: groupsData, error: groupsError },
    { data: studentsData, error: studentsError },
    { data: activitiesData, error: activitiesError },
    { data: activityRecordsData, error: activityRecordsError },
    { data: latestPlan, error: latestPlanError },
    { data: latestActivity, error: latestActivityError },
    { data: latestRecord, error: latestRecordError },
    { data: latestReport, error: latestReportError }
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("lesson_plans").select("id", { count: "exact", head: true }),
    supabase
      .from("activities")
      .select("id,title,activity_date,status")
      .gte("activity_date", new Date().toISOString().slice(0, 10))
      .order("activity_date", { ascending: true })
      .limit(5),
    supabase.from("groups").select("id,name,level"),
    supabase.from("students").select("id,group_id,full_name"),
    supabase.from("activities").select("id,group_id,title,status,activity_date,created_at,updated_at"),
    supabase.from("activity_records").select("id,activity_id,student_id,attended,result_score,created_at,updated_at"),
    supabase.from("lesson_plans").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("activities").select("id,title,activity_date,updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from("activity_records")
      .select("id,created_at,activities(title),students(full_name)")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("reports").select("id,report_type,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (profileError) {
    console.error("Error real profile for dashboard:", profileError);
    throw new Error(`No pudimos cargar tu perfil para el dashboard: ${profileError.message}`);
  }

  if (plansError) {
    console.error("Error real plans count for dashboard:", plansError);
    throw new Error(`No pudimos cargar tus planes para el dashboard: ${plansError.message}`);
  }

  if (upcomingActivitiesError) {
    console.error("Error real upcoming activities for dashboard:", upcomingActivitiesError);
    throw new Error(`No pudimos cargar las próximas actividades: ${upcomingActivitiesError.message}`);
  }

  if (groupsError) {
    console.error("Error real groups for dashboard:", groupsError);
    throw new Error(`No pudimos cargar tus grupos para el dashboard: ${groupsError.message}`);
  }

  if (studentsError) {
    console.error("Error real students for dashboard:", studentsError);
    throw new Error(`No pudimos cargar tus estudiantes para el dashboard: ${studentsError.message}`);
  }

  if (activitiesError) {
    console.error("Error real activities for dashboard:", activitiesError);
    throw new Error(`No pudimos cargar tus actividades para el dashboard: ${activitiesError.message}`);
  }

  if (activityRecordsError) {
    console.error("Error real activity records for dashboard:", activityRecordsError);
    throw new Error(`No pudimos cargar tus registros de resultados para el dashboard: ${activityRecordsError.message}`);
  }

  if (latestPlanError) {
    console.error("Error real latest plan for dashboard:", latestPlanError);
    throw new Error(`No pudimos cargar la actividad reciente de planes: ${latestPlanError.message}`);
  }

  if (latestActivityError) {
    console.error("Error real latest activity for dashboard:", latestActivityError);
    throw new Error(`No pudimos cargar la actividad reciente de actividades: ${latestActivityError.message}`);
  }

  if (latestRecordError) {
    console.error("Error real latest record for dashboard:", latestRecordError);
    throw new Error(`No pudimos cargar la actividad reciente de resultados: ${latestRecordError.message}`);
  }

  if (latestReportError) {
    console.error("Error real latest report for dashboard:", latestReportError);
    throw new Error(`No pudimos cargar la actividad reciente de reportes: ${latestReportError.message}`);
  }

  const groups = groupsData ?? [];
  const students = studentsData ?? [];
  const activities = activitiesData ?? [];
  const records = activityRecordsData ?? [];
  const upcomingCount = upcomingActivities?.length ?? 0;

  const numericScores = records.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
  const overallAverage = average(numericScores);
  const pendingActivities = activities.filter((activity) => !records.some((record) => record.activity_id === activity.id));

  const groupSummaries = groups.map((group) => {
    const groupRecords = records.filter((record) => {
      const activity = activities.find((currentActivity) => currentActivity.id === record.activity_id);
      return activity?.group_id === group.id;
    });
    const groupScores = groupRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const groupAverage = average(groupScores);
    const groupAttendance = groupRecords.length ? (groupRecords.filter((record) => record.attended).length / groupRecords.length) * 100 : null;

    return {
      id: group.id,
      name: group.name,
      level: group.level,
      average: groupAverage,
      attendance: groupAttendance
    };
  });

  const studentAlertsCount = students.filter((student) => {
    const studentRecords = records.filter((record) => record.student_id === student.id);
    const studentScores = studentRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const studentAverage = average(studentScores);
    const absenceRate = studentRecords.length ? (studentRecords.filter((record) => !record.attended).length / studentRecords.length) * 100 : null;

    return Boolean(studentRecords.length) && ((studentAverage !== null && studentAverage < 60) || (absenceRate !== null && absenceRate >= 40));
  }).length;

  const alerts = [
    ...(pendingActivities.length > 0
      ? [
          {
            id: "pending-activities",
            text: `${pendingActivities.length} actividades siguen pendientes de registrar resultados.`
          }
        ]
      : []),
    ...groupSummaries
      .filter((group) => (group.average !== null && group.average < 60) || (group.attendance !== null && group.attendance < 70))
      .slice(0, 2)
      .map((group) => ({
        id: `group-${group.id}`,
        text: `El grupo ${group.name}${group.level ? ` (${group.level})` : ""} necesita seguimiento por promedio o asistencia.`
      })),
    ...(studentAlertsCount > 0
      ? [
          {
            id: "student-alerts",
            text: `${studentAlertsCount} estudiantes presentan alerta por bajo rendimiento o inasistencia.`
          }
        ]
      : [])
  ];

  const recentActivity = [
    ...(latestPlan
      ? [
          {
            id: `plan-${latestPlan.id}`,
            text: `Último plan actualizado: ${latestPlan.title}`,
            time: formatRelativeDate(latestPlan.updated_at)
          }
        ]
      : []),
    ...(latestActivity
      ? [
          {
            id: `activity-${latestActivity.id}`,
            text: `Última actividad programada: ${latestActivity.title}`,
            time: formatRelativeDate(latestActivity.updated_at)
          }
        ]
      : []),
    ...(latestRecord
      ? [
          {
            id: `record-${latestRecord.id}`,
            text: `Último registro guardado: ${(Array.isArray(latestRecord.students) ? latestRecord.students[0] : latestRecord.students)?.full_name ?? "Estudiante"} en ${
              (Array.isArray(latestRecord.activities) ? latestRecord.activities[0] : latestRecord.activities)?.title ?? "actividad"
            }`,
            time: formatRelativeDate(latestRecord.created_at)
          }
        ]
      : []),
    ...(latestReport
      ? [
          {
            id: `report-${latestReport.id}`,
            text: `Último reporte creado: ${latestReport.report_type}`,
            time: formatRelativeDate(latestReport.created_at)
          }
        ]
      : [])
  ].slice(0, 4);

  const kpis = [
    {
      id: "kpi-1",
      title: "Planes creados",
      value: String(plansCount ?? 0),
      numericValue: plansCount ?? 0,
      delta: plansCount ? "Información actualizada del sistema" : "Aún no hay información suficiente",
      toneClass: "text-violet-500"
    },
    {
      id: "kpi-2",
      title: "Próximas actividades",
      value: String(upcomingCount),
      numericValue: upcomingCount,
      delta: upcomingCount ? "Actividades programadas en agenda" : "Aún no hay actividades programadas",
      toneClass: "text-blue-500"
    },
    {
      id: "kpi-3",
      title: "Promedio general",
      value: overallAverage !== null ? overallAverage.toFixed(1) : "Sin datos",
      numericValue: overallAverage,
      decimals: 1,
      delta: overallAverage !== null ? "Calculado con resultados registrados" : "Registra actividades y resultados para completar este indicador",
      toneClass: "text-indigo-500"
    },
    {
      id: "kpi-4",
      title: "Alertas pendientes",
      value: String(alerts.length),
      numericValue: alerts.length,
      delta: alerts.length ? "Alertas reales por revisar" : "Todavía no hay alertas activas",
      toneClass: "text-amber-500"
    }
  ];

  return (
    <DashboardPanel
      teacherName={profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "docente"}
      kpis={kpis}
      quickActions={quickActions}
      recentActivity={recentActivity}
      alerts={alerts}
    />
  );
}
