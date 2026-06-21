// Admin Supabase client — uses service role key, bypasses RLS
// ONLY use in trusted server-side code (Server Actions, API routes)
// NEVER import this in Client Components

import { createClient } from "@supabase/supabase-js";

// Singleton — one admin client for the whole server process
let adminClient: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (adminClient) return adminClient;

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
}
