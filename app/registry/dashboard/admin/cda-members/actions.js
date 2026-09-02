// app/cda-members/actions.js
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { data: profile } = await supabase.from("profiles").select("id, role, full_name").eq("id", user.id).single();
  if (profile?.role !== "admin") return { ok: false, error: "Not authorized." };
  return { ok: true, admin: profile };
}

export async function createCdaMemberAction(form) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const { fullName, email, phone, wardId } = form;
  if (!fullName?.trim() || !email?.trim() || !wardId) {
    return { ok: false, error: "Name, email, and ward are required." };
  }

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
  });
  if (createErr) return { ok: false, error: createErr.message };

  const userId = created.user.id;

  const { error: profileErr } = await admin.from("profiles").insert({
    id: userId, role: "cda", full_name: fullName.trim(), email: email.trim(), phone: phone?.trim() || null,
  });
  if (profileErr) {
    await admin.auth.admin.deleteUser(userId); // roll back the orphaned auth user
    return { ok: false, error: profileErr.message };
  }

  const { error: memberErr } = await admin.from("cda_members").insert({
    id: userId, ward_id: wardId, added_by: auth.admin.id,
  });
  if (memberErr) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: memberErr.message };
  }

  await admin.from("audit_log").insert({
    actor_id: auth.admin.id, actor_name: auth.admin.full_name, actor_role: "admin",
    action: "Added a CDA member", detail: `${fullName.trim()} — ${email.trim()}`,
  });

  revalidatePath("/registry/dashboard/admin/cda-members");
  return { ok: true, credentials: { email: email.trim(), password: tempPassword, name: fullName.trim() } };
}

/** The real access-control lever this schema supports: a CDA member's
 *  permission scope IS their assigned ward (see computeAccess/
 *  computeResidentAccess) — reassigning it changes what they can see and
 *  verify, without touching their account. */
export async function updateCdaMemberWardAction(id, wardId) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (!wardId) return { ok: false, error: "A ward is required." };

  const admin = createAdminClient();
  const { data: member } = await admin.from("profiles").select("full_name").eq("id", id).single();
  const { data: ward } = await admin.from("wards").select("name").eq("id", wardId).single();

  const { error: updateErr } = await admin.from("cda_members").update({ ward_id: wardId }).eq("id", id);
  if (updateErr) return { ok: false, error: updateErr.message };

  await admin.from("audit_log").insert({
    actor_id: auth.admin.id, actor_name: auth.admin.full_name, actor_role: "admin",
    action: "Reassigned a CDA member's ward", detail: `${member?.full_name || id} → ${ward?.name || wardId}`,
  });

  revalidatePath("/registry/dashboard/admin/cda-members");
  return { ok: true };
}

export async function removeCdaMemberAction(id) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { data: member } = await admin.from("profiles").select("full_name, email").eq("id", id).single();

  await admin.from("cda_members").delete().eq("id", id);
  await admin.from("profiles").delete().eq("id", id);
  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) return { ok: false, error: `Removed access records, but auth deletion failed: ${delErr.message}` };

  await admin.from("audit_log").insert({
    actor_id: auth.admin.id, actor_name: auth.admin.full_name, actor_role: "admin",
    action: "Removed a CDA member", detail: member?.full_name || member?.email || id,
  });

  revalidatePath("/registry/dashboard/admin/cda-members");
  return { ok: true };
}