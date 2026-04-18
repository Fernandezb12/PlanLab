"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export const LogoutButton = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        // Yo centralizo logout para reutilizarlo en cualquier módulo.
        setIsPending(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
        setIsPending(false);
      }}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
};
