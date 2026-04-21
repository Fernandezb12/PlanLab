import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublishableKey, getSupabaseUrl } from "./config";

export const createClient = () => createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
