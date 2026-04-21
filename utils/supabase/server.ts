import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublishableKey, getSupabaseUrl } from "./config";

type CookieInput = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export const createClient = async () => {
  const cookieStore = await cookies();

  // Yo paso cookies en SSR para mantener la sesión consistente en App Router.
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieInput[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      }
    }
  });
};
