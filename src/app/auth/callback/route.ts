import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth/update-password";
  const redirectUrl = request.nextUrl.clone();

  if (!code) {
    redirectUrl.pathname = "/auth/update-password";
    redirectUrl.search = "error=access_denied&error_code=otp_expired";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Error real en callback de Supabase Auth:", error);
    redirectUrl.pathname = "/auth/update-password";
    redirectUrl.search = "error=access_denied&error_code=otp_expired";
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = next.startsWith("/") ? next : "/auth/update-password";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
