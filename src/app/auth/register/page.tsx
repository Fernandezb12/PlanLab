import Link from "next/link";

import { AuthForm } from "@/features/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <section className="w-full space-y-4">
        <h1 className="text-3xl font-bold">Crear cuenta</h1>
        <AuthForm />
        <p className="text-sm text-slate-500">¿Ya tienes cuenta? <Link href="/auth/login" className="text-brand-600">Inicia sesión</Link></p>
      </section>
    </main>
  );
}
