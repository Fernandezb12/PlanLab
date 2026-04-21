import { redirect } from "next/navigation";

import { ResultsPanel } from "@/features/results/results-panel";
import { createClient } from "@/lib/supabase/server";

type ResultsAlert = {
  id: string;
  text: string;
  tone: "warning" | "risk" | "info";
};

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

export default async function ResultadosPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: groupsData, error: groupsError },
    { data: studentsData, error: studentsError },
    { data: activitiesData, error: activitiesError },
    { data: activityRecordsData, error: activityRecordsError }
  ] = await Promise.all([
    supabase.from("groups").select("id,name,level"),
    supabase.from("students").select("id,group_id,full_name,status"),
    supabase.from("activities").select("id,group_id,title,status"),
    supabase.from("activity_records").select("id,activity_id,student_id,attended,result_score,observation")
  ]);

  if (groupsError) {
    console.error("Error real groups for results:", groupsError);
    throw new Error(`No pudimos cargar tus grupos para resultados: ${groupsError.message}`);
  }

  if (studentsError) {
    console.error("Error real students for results:", studentsError);
    throw new Error(`No pudimos cargar tus estudiantes para resultados: ${studentsError.message}`);
  }

  if (activitiesError) {
    console.error("Error real activities for results:", activitiesError);
    throw new Error(`No pudimos cargar tus actividades para resultados: ${activitiesError.message}`);
  }

  if (activityRecordsError) {
    console.error("Error real activity records for results:", activityRecordsError);
    throw new Error(`No pudimos cargar los registros reales de actividades: ${activityRecordsError.message}`);
  }

  const groups = groupsData ?? [];
  const students = studentsData ?? [];
  const activities = activitiesData ?? [];
  const records = activityRecordsData ?? [];

  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const recordsWithActivity = records
    .map((record) => {
      const activity = activityById.get(record.activity_id);

      if (!activity) {
        return null;
      }

      return {
        ...record,
        group_id: activity.group_id,
        activity_title: activity.title
      };
    })
    .filter(
      (
        record
      ): record is {
        id: string;
        activity_id: string;
        student_id: string;
        attended: boolean;
        result_score: number | null;
        observation: string | null;
        group_id: string | null;
        activity_title: string;
      } => Boolean(record)
    );

  const numericScores = recordsWithActivity
    .map((record) => record.result_score)
    .filter((score): score is number => typeof score === "number");

  const attendanceAverage =
    recordsWithActivity.length > 0 ? (recordsWithActivity.filter((record) => record.attended).length / recordsWithActivity.length) * 100 : null;

  const generalAverage = average(numericScores);
  const pendingActivitiesCount = activities.filter((activity) => !recordsWithActivity.some((record) => record.activity_id === activity.id)).length;

  const groupSummaries = groups.map((group) => {
    const groupStudents = students.filter((student) => student.group_id === group.id);
    const groupActivities = activities.filter((activity) => activity.group_id === group.id);
    const groupRecords = recordsWithActivity.filter((record) => record.group_id === group.id);
    const groupScores = groupRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const groupAttendance = groupRecords.length ? (groupRecords.filter((record) => record.attended).length / groupRecords.length) * 100 : null;
    const groupAverage = average(groupScores);
    const recordedActivitiesCount = new Set(groupRecords.map((record) => record.activity_id)).size;

    let tone: "stable" | "watch" | "risk" = "stable";

    if ((groupAverage !== null && groupAverage < 60) || (groupAttendance !== null && groupAttendance < 70)) {
      tone = "risk";
    } else if ((groupAverage !== null && groupAverage < 75) || (groupAttendance !== null && groupAttendance < 85)) {
      tone = "watch";
    }

    return {
      id: group.id,
      name: group.name,
      level: group.level,
      studentsCount: groupStudents.length,
      activitiesCount: groupActivities.length,
      recordedActivitiesCount,
      averageScore: groupAverage,
      attendanceRate: groupAttendance,
      tone
    };
  });

  const studentAlerts = students
    .map((student) => {
      const studentRecords = recordsWithActivity.filter((record) => record.student_id === student.id);
      const studentScores = studentRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
      const studentAverage = average(studentScores);
      const absenceRate = studentRecords.length
        ? (studentRecords.filter((record) => !record.attended).length / studentRecords.length) * 100
        : null;

      if (!studentRecords.length) {
        return null;
      }

      if ((studentAverage !== null && studentAverage < 60) || (absenceRate !== null && absenceRate >= 40)) {
        return {
          id: student.id,
          full_name: student.full_name,
          group_id: student.group_id,
          average: studentAverage,
          absenceRate
        };
      }

      return null;
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  const groupDifficultyAlerts = groupSummaries.filter((group) => group.tone !== "stable");
  const groupsWithDifficulty = groupDifficultyAlerts.length;
  const studentsWithAlert = studentAlerts.length;

  const alerts: ResultsAlert[] = [
    ...groupDifficultyAlerts.slice(0, 3).map((group) => ({
      id: `group-${group.id}`,
      tone: (group.tone === "risk" ? "risk" : "warning") as ResultsAlert["tone"],
      text: `El grupo ${group.name} ${group.level ? `(${group.level}) ` : ""}necesita seguimiento: promedio ${group.averageScore?.toFixed(1) ?? "sin nota"} y asistencia ${group.attendanceRate ? `${Math.round(group.attendanceRate)}%` : "sin registros"}.`
    })),
    ...studentAlerts.slice(0, 3).map((student) => ({
      id: `student-${student.id}`,
      tone: "warning" as const,
      text: `${student.full_name} presenta alerta por ${student.average !== null && student.average < 60 ? "bajo rendimiento" : "inasistencia recurrente"}.`
    })),
    ...(pendingActivitiesCount > 0
      ? [
          {
            id: "pending-activities",
            tone: "info" as const,
            text: `Hay ${pendingActivitiesCount} actividades pendientes de registro. Completar esos resultados mejorará la lectura del módulo.`
          }
        ]
      : [])
  ];

  return (
    <ResultsPanel
      generalAverage={generalAverage}
      attendanceAverage={attendanceAverage}
      groupsWithDifficulty={groupsWithDifficulty}
      studentsWithAlert={studentsWithAlert}
      pendingActivitiesCount={pendingActivitiesCount}
      totalRecords={recordsWithActivity.length}
      groupSummaries={groupSummaries}
      alerts={alerts}
    />
  );
}
