export const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const getSupabasePublishableKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
