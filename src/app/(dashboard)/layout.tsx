import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardShell
      userProfile={{
        fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | null) ?? null,
        email: profile?.email ?? user.email ?? null
      }}
    >
      {children}
    </DashboardShell>
  );
}
