import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and keeps the
 * response cookies in sync. Called from the root middleware.js — this is
 * the standard @supabase/ssr pattern for Next.js App Router. Without this,
 * sessions silently expire mid-use instead of refreshing transparently.
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required: this call refreshes the session token and writes the
  // refreshed cookies onto supabaseResponse above. Page-level auth checks
  // still happen in useRequireRole / Server Components — this middleware
  // only keeps the session alive, it doesn't gate routes itself.
  await supabase.auth.getUser();

  return supabaseResponse;
}