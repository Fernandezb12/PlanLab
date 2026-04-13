import Link from "next/link";

import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <section className="w-full space-y-4">
        <h1 className="text-3xl font-bold">Iniciar sesión</h1>
        <AuthForm />
        <p className="text-sm text-slate-500">¿No tienes cuenta? <Link href="/auth/register" className="text-brand-600">Regístrate</Link></p>
      </section>
    </main>
  );
}
