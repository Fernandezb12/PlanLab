import { redirect } from "next/navigation";

import { PlansPanel } from "@/features/plans/plans-panel";
import { createClient } from "@/lib/supabase/server";

export default async function PlanesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: groupsData, error: groupsError },
    { data: plansData, error: plansError }
  ] = await Promise.all([
    supabase.from("groups").select("id,name,level").order("created_at", { ascending: false }),
    supabase
      .from("lesson_plans")
      .select("id,group_id,title,subject,topic,duration_minutes,objective,resources,evaluation_type,status,created_at,groups(name,level)")
      .order("updated_at", { ascending: false })
  ]);

  if (groupsError) {
    console.error("Error real groups for plans:", groupsError);
    throw new Error(`No pudimos cargar tus grupos para planificar: ${groupsError.message}`);
  }

  if (plansError) {
    console.error("Error real plans:", plansError);
    throw new Error(`No pudimos cargar tus planes: ${plansError.message}`);
  }

  return <PlansPanel groups={groupsData ?? []} plans={plansData ?? []} />;
}
