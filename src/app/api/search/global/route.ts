import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getActivityStatusLabel } from "@/lib/validations/activities";
import { getReportTypeLabel } from "@/lib/validations/reports";

export const runtime = "nodejs";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        query,
        plans: [],
        activities: [],
        students: [],
        groups: [],
        reports: []
      });
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const likeQuery = `%${query}%`;

    const [
      { data: plansData, error: plansError },
      { data: activitiesData, error: activitiesError },
      { data: studentsData, error: studentsError },
      { data: groupsData, error: groupsError },
      { data: reportsData, error: reportsError }
    ] = await Promise.all([
      supabase
        .from("lesson_plans")
        .select("id,title,subject,topic,groups(name)")
        .eq("user_id", user.id)
        .or(`title.ilike.${likeQuery},topic.ilike.${likeQuery},subject.ilike.${likeQuery}`)
        .limit(5),
      supabase
        .from("activities")
        .select("id,title,status,groups(name)")
        .eq("user_id", user.id)
        .ilike("title", likeQuery)
        .limit(5),
      supabase
        .from("students")
        .select("id,full_name,student_code,groups(name)")
        .eq("user_id", user.id)
        .or(`full_name.ilike.${likeQuery},student_code.ilike.${likeQuery}`)
        .limit(5),
      supabase
        .from("groups")
        .select("id,name,level,subject")
        .eq("user_id", user.id)
        .or(`name.ilike.${likeQuery},level.ilike.${likeQuery},subject.ilike.${likeQuery}`)
        .limit(5),
      supabase
        .from("reports")
        .select("id,report_type,groups(name),activities(title)")
        .eq("user_id", user.id)
        .ilike("report_type", likeQuery)
        .limit(5)
    ]);

    if (plansError || activitiesError || studentsError || groupsError || reportsError) {
      console.error("Error real en búsqueda global:", {
        plansError,
        activitiesError,
        studentsError,
        groupsError,
        reportsError
      });

      return NextResponse.json({ message: "No fue posible completar la búsqueda en este momento." }, { status: 500 });
    }

    const plans: SearchItem[] = (plansData ?? []).map((plan) => ({
      id: plan.id,
      title: plan.title,
      subtitle: `${plan.subject} · ${plan.topic}${(Array.isArray(plan.groups) ? plan.groups[0] : plan.groups)?.name ? ` · ${(Array.isArray(plan.groups) ? plan.groups[0] : plan.groups)?.name}` : ""}`,
      href: "/planes"
    }));

    const activities: SearchItem[] = (activitiesData ?? []).map((activity) => ({
      id: activity.id,
      title: activity.title,
      subtitle: `${(Array.isArray(activity.groups) ? activity.groups[0] : activity.groups)?.name ?? "Sin grupo"} · ${getActivityStatusLabel(activity.status)}`,
      href: "/actividades"
    }));

    const students: SearchItem[] = (studentsData ?? []).map((student) => ({
      id: student.id,
      title: student.full_name,
      subtitle: `${student.student_code ?? "Sin código"} · ${(Array.isArray(student.groups) ? student.groups[0] : student.groups)?.name ?? "Sin grupo"}`,
      href: "/grupos"
    }));

    const groups: SearchItem[] = (groupsData ?? []).map((group) => ({
      id: group.id,
      title: group.name,
      subtitle: `${group.level ?? "Sin nivel"}${group.subject ? ` · ${group.subject}` : ""}`,
      href: "/grupos"
    }));

    const reports: SearchItem[] = (reportsData ?? []).map((report) => ({
      id: report.id,
      title: getReportTypeLabel(report.report_type),
      subtitle: `${(Array.isArray(report.groups) ? report.groups[0] : report.groups)?.name ?? "Sin grupo"}${(Array.isArray(report.activities) ? report.activities[0] : report.activities)?.title ? ` · ${(Array.isArray(report.activities) ? report.activities[0] : report.activities)?.title}` : ""}`,
      href: "/reportes"
    }));

    return NextResponse.json({
      query,
      plans,
      activities,
      students,
      groups,
      reports
    });
  } catch (error) {
    console.error("Excepción en búsqueda global:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible completar la búsqueda."
      },
      { status: 500 }
    );
  }
}
