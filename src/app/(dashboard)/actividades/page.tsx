import { redirect } from "next/navigation";

import { ActivitiesPanel } from "@/features/activities/activities-panel";
import { createClient } from "@/lib/supabase/server";

export default async function ActividadesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: groupsData, error: groupsError },
    { data: lessonPlansData, error: lessonPlansError },
    { data: activitiesData, error: activitiesError }
  ] = await Promise.all([
    supabase.from("groups").select("id,name,level").order("created_at", { ascending: false }),
    supabase
      .from("lesson_plans")
      .select("id,title,group_id,subject,topic,groups(name,level)")
      .order("updated_at", { ascending: false }),
    supabase
      .from("activities")
      .select("id,lesson_plan_id,group_id,title,activity_date,status,notes,created_at,lesson_plans(title),groups(name,level)")
      .order("activity_date", { ascending: false, nullsFirst: false })
  ]);

  if (groupsError) {
    console.error("Error real groups for activities:", groupsError);
    throw new Error(`No pudimos cargar tus grupos para actividades: ${groupsError.message}`);
  }

  if (lessonPlansError) {
    console.error("Error real lesson plans for activities:", lessonPlansError);
    throw new Error(`No pudimos cargar tus planes para actividades: ${lessonPlansError.message}`);
  }

  if (activitiesError) {
    console.error("Error real activities:", activitiesError);
    throw new Error(`No pudimos cargar tus actividades: ${activitiesError.message}`);
  }

  return <ActivitiesPanel groups={groupsData ?? []} lessonPlans={lessonPlansData ?? []} activities={activitiesData ?? []} />;
}
