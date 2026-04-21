import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "./utils/supabase/middleware";

const protectedRoutes = ["/dashboard", "/planes", "/actividades", "/resultados", "/reportes", "/grupos", "/perfil"];
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/planes/:path*", "/actividades/:path*", "/resultados/:path*", "/reportes/:path*", "/grupos/:path*", "/perfil/:path*", "/auth/:path*"]
};
