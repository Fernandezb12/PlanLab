import { Lock, LogOut, Palette } from "lucide-react";

import { Card } from "@/components/ui/card";
import { profileData } from "@/data/mock";

export default function PerfilPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Perfil y Configuración</h1>
        <p className="text-sm text-slate-500">Administra tus datos y preferencias de la plataforma.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card-plus">
          <h2 className="mb-4 text-xl font-bold">Datos del docente</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">Nombre:</span> {profileData.fullName}</p>
            <p><span className="font-semibold">Correo:</span> {profileData.email}</p>
            <p><span className="font-semibold">Nivel educativo principal:</span> {profileData.level}</p>
          </div>
        </Card>

        <Card className="glass-card-plus">
          <h2 className="mb-4 text-xl font-bold">Preferencias</h2>
          <ul className="space-y-2 text-sm">
            {profileData.preferences.map((pref) => (
              <li key={pref} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">{pref}</li>
            ))}
          </ul>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Palette className="h-4 w-4" /> Tema actual: {profileData.theme}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-white/10">
          <Lock className="h-4 w-4" />
          Cambiar contraseña
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </section>
  );
}
