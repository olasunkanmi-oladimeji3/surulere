// lib/supabase/server.ts (or wherever createAdminClient lives)
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only, NOT prefixed NEXT_PUBLIC_
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};