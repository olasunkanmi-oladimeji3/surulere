import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/create-staff
 * Creates a new LG Staff (admin) account. Only an existing admin can call
 * this — verified by reading the caller's session server-side.
 *
 * Body: { fullName, email, phone, title, password }
 *
 * Flow:
 *   1. Verify caller is authenticated and has role === 'admin'
 *   2. Create the auth user with service role key (admin.createUser)
 *      → triggers handle_new_user() which inserts into profiles
 *   3. Return the new user's id
 */
export async function POST(request) {
  // Step 1: verify caller is an admin
  const supabase = await createClient();
  const { data: { user: caller }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile, error: profileError } = await supabase
    .from("profiles").select("role").eq("id", caller.id).single();
  if (profileError || callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Only LG Staff can create new staff accounts." }, { status: 403 });
  }

  // Step 2: parse and validate the request body
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.fullName || !body?.password) {
    return NextResponse.json({ error: "fullName, email, and password are required." }, { status: 400 });
  }
  const { fullName, email, phone, title, password } = body;

  // Step 3: create the auth + profile using the service role key
  const adminClient = createAdminClient();
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation for staff accounts — they're created by another admin
    user_metadata: {
      role: "admin",
      full_name: fullName,
      phone: phone || null,
      title: title || null,
    },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Step 4: log to audit_log
  await supabase.from("audit_log").insert({
    actor_id: caller.id,
    actor_name: callerProfile?.full_name || "Unknown",
    actor_role: "admin",
    action: "Added LG Staff member",
    detail: `${fullName} (${email})`,
  });

  return NextResponse.json({ ok: true, userId: newUser.user.id });
}