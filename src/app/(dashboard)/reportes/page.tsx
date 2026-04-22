import { redirect } from "next/navigation";

import { ReportsPanel } from "@/features/reports/reports-panel";
import { createClient } from "@/lib/supabase/server";

export default async function ReportesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: groupsData, error: groupsError },
    { data: activitiesData, error: activitiesError },
    { data: reportsData, error: reportsError }
  ] = await Promise.all([
    supabase.from("groups").select("id,name,level").order("created_at", { ascending: false }),
    supabase.from("activities").select("id,title,group_id,activity_date").order("activity_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("reports")
      .select("id,report_type,file_url,created_at,groups(name,level),activities(title,activity_date)")
      .order("created_at", { ascending: false })
  ]);

  if (groupsError) {
    console.error("Error real groups for reports:", groupsError);
    throw new Error(`No pudimos cargar tus grupos para reportes: ${groupsError.message}`);
  }

  if (activitiesError) {
    console.error("Error real activities for reports:", activitiesError);
    throw new Error(`No pudimos cargar tus actividades para reportes: ${activitiesError.message}`);
  }

  if (reportsError) {
    console.error("Error real reports:", reportsError);
    throw new Error(`No pudimos cargar tus reportes: ${reportsError.message}`);
  }

  return <ReportsPanel groups={groupsData ?? []} activities={activitiesData ?? []} reports={reportsData ?? []} />;
}
