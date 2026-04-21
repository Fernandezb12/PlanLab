import { redirect } from "next/navigation";

import { GroupsStudentsPanel } from "@/features/groups/groups-students-panel";
import { createClient } from "@/lib/supabase/server";

export default async function GruposPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    { data: groupsData, error: groupsError },
    { data: studentsData, error: studentsError }
  ] = await Promise.all([
    supabase.from("groups").select("id,name,level,subject,period").order("created_at", { ascending: false }),
    supabase
      .from("students")
      .select("id,full_name,student_code,status,notes,group_id,groups(id,name)")
      .order("created_at", { ascending: false })
  ]);

  if (groupsError) {
    console.error("Error real groups:", groupsError);
    throw new Error(`No pudimos cargar tus grupos: ${groupsError.message}`);
  }

  if (studentsError) {
    console.error("Error real students:", studentsError);
    throw new Error(`No pudimos cargar tus estudiantes: ${studentsError.message}`);
  }

  const groups = (groupsData ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    level: group.level,
    subject: group.subject,
    period: group.period ?? null,
    studentCount: (studentsData ?? []).filter((student) => student.group_id === group.id).length
  }));

  return <GroupsStudentsPanel groups={groups} students={studentsData ?? []} />;
}
