"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const EDITABLE_FIELDS = [
  "first_name", "last_name", "middle_name", "date_of_birth", "gender", "marital_status",
  "state_of_origin", "alternative_phone", "landmark", "years_at_address", "nin", "voter_card_number",
  "occupation", "employment_status", "employer_name", "employer_address",
  "emergency_contact_name", "emergency_contact_relationship", "emergency_contact_phone",
  "disability", "disability_type", "chronic_illness", "chronic_illness_type",
];

/**
 * Edits a real resident's own record. Scoped to the `residents` table only —
 * field-collected residents (`field_residents`, from the anonymous field-form
 * flow) have a different shape and aren't covered by this action yet.
 *
 * Same authorization boundary as NIN visibility (see lib/access.js /
 * computeResidentAccess): admin, the resident themself, or the property's
 * owner — not an assigned CDA member, who verifies/flags but doesn't edit.
 */
export async function updateResidentAction(residentId, fields) {
  const cookieStore = await cookies();
  const supabase = createAdminClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const { data: resident } = await supabase
    .from("residents")
    .select("id, properties ( owner_id )")
    .eq("id", residentId).single();
  if (!resident) return { ok: false, error: "Resident not found." };

  const isAdmin = profile?.role === "admin";
  const isSelf = user.id === residentId;
  const isOwner = profile?.role === "owner" && resident.properties?.owner_id === user.id;
  if (!isAdmin && !isSelf && !isOwner) return { ok: false, error: "Not authorized." };

  const firstName = fields.first_name?.trim();
  const lastName = fields.last_name?.trim();
  if (!firstName || !lastName) return { ok: false, error: "First and last name are required." };

  const update = { updated_at: new Date().toISOString() };
  for (const key of EDITABLE_FIELDS) {
    if (key in fields) update[key] = typeof fields[key] === "string" ? fields[key].trim() || null : fields[key];
  }

  const { error: updateErr } = await supabase.from("residents").update(update).eq("id", residentId);
  if (updateErr) return { ok: false, error: updateErr.message };

  await supabase.from("audit_log").insert({
    actor_id: user.id, actor_name: profile.full_name, actor_role: profile.role,
    action: "Updated resident details", detail: `${firstName} ${lastName}`,
  });

  revalidatePath(`/registry/resident/${residentId}`);
  return { ok: true };
}
