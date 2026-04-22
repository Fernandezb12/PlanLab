import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

type NotificationType =
  | "activity_pending"
  | "group_alert"
  | "student_alert"
  | "report_created"
  | "plan_ai"
  | "document_exported"
  | "review_reminder";

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  dedupe_key: string | null;
  created_at: string;
};

export type NotificationsPayload = {
  notifications: NotificationRecord[];
  persistenceEnabled: boolean;
};

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string | null;
  metadata?: Record<string, unknown> | null;
  dedupeKey?: string | null;
};

type DerivedNotificationCandidate = Omit<CreateNotificationInput, "userId"> & {
  createdAt: string;
};

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

export const isNotificationsTableMissingError = (error: Pick<PostgrestError, "code" | "message"> | null | undefined) => {
  if (!error) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? "";
  return error.code === "PGRST205" || error.code === "42P01" || message.includes("public.notifications") || message.includes("schema cache");
};

const mapCandidatesToRecords = (candidates: DerivedNotificationCandidate[], limit: number): NotificationRecord[] =>
  candidates
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, limit)
    .map((candidate) => ({
      id: candidate.dedupeKey ?? `${candidate.type}-${candidate.createdAt}`,
      type: candidate.type,
      title: candidate.title,
      message: candidate.message,
      href: candidate.href ?? null,
      is_read: false,
      metadata: candidate.metadata ?? null,
      dedupe_key: candidate.dedupeKey ?? null,
      created_at: candidate.createdAt
    }));

const collectDerivedNotificationCandidates = async (supabase: SupabaseClient, userId: string): Promise<DerivedNotificationCandidate[]> => {
  const [{ data: groupsData, error: groupsError }, { data: studentsData, error: studentsError }, { data: activitiesData, error: activitiesError }, { data: recordsData, error: recordsError }] =
    await Promise.all([
      supabase.from("groups").select("id,name,level").eq("user_id", userId),
      supabase.from("students").select("id,group_id,full_name").eq("user_id", userId),
      supabase.from("activities").select("id,group_id,title,status,created_at").eq("user_id", userId),
      supabase.from("activity_records").select("id,activity_id,student_id,attended,result_score,created_at").eq("user_id", userId)
    ]);

  if (groupsError || studentsError || activitiesError || recordsError) {
    console.error("Error real calculando notificaciones derivadas:", {
      groupsError,
      studentsError,
      activitiesError,
      recordsError
    });
    throw new Error("No fue posible calcular las notificaciones del sistema.");
  }

  const groups = groupsData ?? [];
  const students = studentsData ?? [];
  const activities = activitiesData ?? [];
  const records = recordsData ?? [];
  const now = new Date().toISOString();
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const candidates: DerivedNotificationCandidate[] = [];

  const pendingActivities = activities.filter((activity) => !records.some((record) => record.activity_id === activity.id));

  for (const activity of pendingActivities.slice(0, 8)) {
    candidates.push({
      type: "activity_pending",
      title: "Actividad pendiente de registro",
      message: `${activity.title} todavía no tiene resultados consolidados.`,
      href: "/actividades",
      metadata: { activityId: activity.id, groupId: activity.group_id },
      dedupeKey: `pending-activity:${activity.id}`,
      createdAt: activity.created_at ?? now
    });
  }

  const groupSummaries = groups.map((group) => {
    const groupStudents = students.filter((student) => student.group_id === group.id);
    const groupRecords = records.filter((record) => activityById.get(record.activity_id)?.group_id === group.id);
    const groupScores = groupRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const averageScore = average(groupScores);
    const attendanceRate = groupRecords.length ? (groupRecords.filter((record) => record.attended).length / groupRecords.length) * 100 : null;

    let tone: "stable" | "watch" | "risk" = "stable";

    if ((averageScore !== null && averageScore < 60) || (attendanceRate !== null && attendanceRate < 70)) {
      tone = "risk";
    } else if ((averageScore !== null && averageScore < 75) || (attendanceRate !== null && attendanceRate < 85)) {
      tone = "watch";
    }

    return {
      id: group.id,
      name: group.name,
      level: group.level,
      studentsCount: groupStudents.length,
      averageScore,
      attendanceRate,
      tone
    };
  });

  for (const group of groupSummaries.filter((item) => item.tone !== "stable").slice(0, 6)) {
    candidates.push({
      type: "group_alert",
      title: group.tone === "risk" ? "Grupo con alerta prioritaria" : "Grupo en seguimiento",
      message: `${group.name}${group.level ? ` · ${group.level}` : ""} presenta promedio ${group.averageScore?.toFixed(1) ?? "sin nota"} y asistencia ${
        group.attendanceRate === null ? "sin registros" : `${Math.round(group.attendanceRate)}%`
      }.`,
      href: "/resultados",
      metadata: { groupId: group.id, tone: group.tone },
      dedupeKey: `group-alert:${group.id}:${group.tone}`,
      createdAt: now
    });
  }

  const studentAlerts = students
    .map((student) => {
      const studentRecords = records.filter((record) => record.student_id === student.id);
      const studentScores = studentRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
      const studentAverage = average(studentScores);
      const absenceRate = studentRecords.length ? (studentRecords.filter((record) => !record.attended).length / studentRecords.length) * 100 : null;

      if (!studentRecords.length) {
        return null;
      }

      if ((studentAverage !== null && studentAverage < 60) || (absenceRate !== null && absenceRate >= 40)) {
        return {
          id: student.id,
          fullName: student.full_name,
          average: studentAverage,
          absenceRate
        };
      }

      return null;
    })
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  for (const student of studentAlerts.slice(0, 8)) {
    candidates.push({
      type: "student_alert",
      title: "Estudiante con seguimiento sugerido",
      message: `${student.fullName} presenta alerta por ${student.average !== null && student.average < 60 ? "bajo rendimiento" : "inasistencia reiterada"}.`,
      href: "/resultados",
      metadata: { studentId: student.id },
      dedupeKey: `student-alert:${student.id}`,
      createdAt: now
    });
  }

  return candidates;
};

const materializeDerivedNotifications = async (supabase: SupabaseClient, userId: string, candidates: DerivedNotificationCandidate[]) => {
  const { data: existingNotifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id,dedupe_key")
    .eq("user_id", userId)
    .not("dedupe_key", "is", null);

  if (notificationsError) {
    if (isNotificationsTableMissingError(notificationsError)) {
      return false;
    }

    console.error("Error real materializando notificaciones derivadas:", notificationsError);
    return false;
  }

  const existingKeys = new Set((existingNotifications ?? []).map((notification) => notification.dedupe_key).filter(Boolean));
  const activeKeys = new Set<string>();

  for (const candidate of candidates) {
    if (!candidate.dedupeKey) {
      continue;
    }

    activeKeys.add(candidate.dedupeKey);

    if (!existingKeys.has(candidate.dedupeKey)) {
      await createNotification(supabase, {
        userId,
        type: candidate.type,
        title: candidate.title,
        message: candidate.message,
        href: candidate.href,
        metadata: candidate.metadata,
        dedupeKey: candidate.dedupeKey
      });
    }
  }

  const staleKeys = [...existingKeys].filter(
    (key): key is string =>
      Boolean(key) &&
      (key.startsWith("pending-activity:") || key.startsWith("group-alert:") || key.startsWith("student-alert:")) &&
      !activeKeys.has(key)
  );

  if (staleKeys.length) {
    const { error } = await supabase.from("notifications").delete().eq("user_id", userId).in("dedupe_key", staleKeys);

    if (error && !isNotificationsTableMissingError(error)) {
      console.error("Error real limpiando notificaciones derivadas obsoletas:", error);
    }
  }

  return true;
};

export const createNotification = async (supabase: SupabaseClient, input: CreateNotificationInput) => {
  const payload = {
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    href: input.href ?? null,
    metadata: input.metadata ?? null,
    dedupe_key: input.dedupeKey ?? null
  };

  const query = input.dedupeKey
    ? supabase.from("notifications").upsert(payload, { onConflict: "user_id,dedupe_key" })
    : supabase.from("notifications").insert(payload);

  const { error } = await query;

  if (error) {
    if (isNotificationsTableMissingError(error)) {
      return false;
    }

    console.error("Error real creando notificación:", error);
    return false;
  }

  return true;
};

export const listNotifications = async (supabase: SupabaseClient, userId: string, limit = 12): Promise<NotificationsPayload> => {
  const derivedCandidates = await collectDerivedNotificationCandidates(supabase, userId);
  const persistenceEnabled = await materializeDerivedNotifications(supabase, userId, derivedCandidates);

  if (!persistenceEnabled) {
    return {
      notifications: mapCandidatesToRecords(derivedCandidates, limit),
      persistenceEnabled: false
    };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,title,message,href,is_read,metadata,dedupe_key,created_at")
    .eq("user_id", userId)
    .order("is_read", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isNotificationsTableMissingError(error)) {
      return {
        notifications: mapCandidatesToRecords(derivedCandidates, limit),
        persistenceEnabled: false
      };
    }

    console.error("Error real listando notificaciones:", error);
    throw new Error(`No fue posible cargar las notificaciones: ${error.message}`);
  }

  return {
    notifications: (data ?? []) as NotificationRecord[],
    persistenceEnabled: true
  };
};
