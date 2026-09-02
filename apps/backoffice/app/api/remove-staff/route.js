import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/remove-staff
 * Removes an LG Staff member's account. Only an existing admin can call
 * this, and they cannot remove themselves.
 *
 * Body: { userId }
 */
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user: caller }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles").select("role, full_name").eq("id", caller.id).single();
  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Only LG Staff can remove staff accounts." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { userId } = body || {};
  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });
  if (userId === caller.id) {
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 });
  }

  // Verify the target is actually an admin
  const { data: targetProfile } = await supabase
    .from("profiles").select("role, full_name").eq("id", userId).single();
  if (!targetProfile || targetProfile.role !== "admin") {
    return NextResponse.json({ error: "User not found or not a staff member." }, { status: 404 });
  }

  // Log before deleting so we still have the name
  await supabase.from("audit_log").insert({
    actor_id: caller.id,
    actor_name: callerProfile.full_name || "Unknown",
    actor_role: "admin",
    action: "Removed LG Staff member",
    detail: targetProfile.full_name,
  });

  const adminClient = createAdminClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}