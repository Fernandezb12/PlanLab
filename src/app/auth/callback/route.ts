import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth/update-password";
  const redirectUrl = new URL(request.url);

  if (!code) {
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "error=recovery_failed";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error real en callback de Supabase Auth:", error);
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "error=recovery_failed";
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = next.startsWith("/") ? next : "/auth/update-password";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
