import { Lock, Palette } from "lucide-react";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,main_education_level")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="space-y-6">
      <ModuleHeader title="Perfil y Configuración" subtitle="Administra tus datos y preferencias de la plataforma." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card-plus p-5">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Datos del docente</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">Nombre:</span> {profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "Sin nombre"}</p>
            <p><span className="font-semibold">Correo:</span> {profile?.email ?? user.email ?? "Sin correo"}</p>
            <p><span className="font-semibold">Nivel educativo principal:</span> {profile?.main_education_level ?? "No definido"}</p>
          </div>
        </Card>

        <Card id="configuracion" className="glass-card-plus p-5">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Preferencias</h2>
          <p className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            En la siguiente fase habilitaré la edición de preferencias docentes.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Palette className="h-4 w-4" /> Tema actual: Sistema</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-white/10">
          <Lock className="h-4 w-4" />
          Cambiar contraseña
        </button>
        <LogoutButton />
      </div>
    </section>
  );
}
