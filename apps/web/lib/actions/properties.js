"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function removeTenantAction(propertyId, unitId) {
  const cookieStore = await cookies();
  const supabase = createAdminClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const { data: property } = await supabase.from("properties").select("owner_id").eq("id", propertyId).single();

  const isAdmin = profile?.role === "admin";
  const isOwner = profile?.role === "owner" && property?.owner_id === user.id;
  if (!isAdmin && !isOwner) return { ok: false, error: "Not authorized." };

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, residents ( id, resident_id ) ")
    .eq("id", unitId).eq("property_id", propertyId).single();

  const tenant = unit?.residents?.[0];
  if (!tenant) return { ok: false, error: "No tenant on this unit." };

  const { error: delErr } = await supabase.from("residents").delete().eq("id", tenant.id);
  if (delErr) return { ok: false, error: delErr.message };

  await supabase.from("audit_log").insert({
    actor_id: user.id, actor_name: profile.full_name, actor_role: profile.role,
    action: "Removed a tenant", detail: `${tenant.resident_id} from unit ${unit.unit_number}`,
  });

  revalidatePath(`/registry/property/${propertyId}`);
  return { ok: true };
}

export async function logVisitAction(propertyId, outcome, note) {
  const cookieStore = await cookies();
  const supabase = createAdminClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const { data: property } = await supabase.from("properties").select("ward_id, property_number").eq("id", propertyId).single();
  if (!property) return { ok: false, error: "Property not found." };

  const isAdmin = profile?.role === "admin";
  let isAssignedCda = false;
  if (profile?.role === "cda") {
    const { data } = await supabase
      .from("cda_members").select("ward_id")
      .eq("id", user.id).eq("ward_id", property.ward_id).maybeSingle();
    isAssignedCda = !!data;
  }
  if (!isAdmin && !isAssignedCda) return { ok: false, error: "Not authorized." };

  const trimmedNote = note.trim();

  const { error: updateErr } = await supabase
    .from("properties")
    .update({
      status: outcome,
      flag_note: outcome === "flagged" ? trimmedNote : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId);
  if (updateErr) return { ok: false, error: updateErr.message };

  const { error: logErr } = await supabase.from("verification_logs").insert({
    property_id: propertyId,
    actor_id: user.id,
    outcome,
    note: trimmedNote,
  });
  if (logErr) return { ok: false, error: logErr.message };

  await supabase.from("audit_log").insert({
    actor_id: user.id, actor_name: profile.full_name, actor_role: profile.role,
    action: outcome === "verified" ? "Verified a property" : "Flagged a property",
    detail: `${property.property_number} — ${trimmedNote}`,
  });

  revalidatePath(`/registry/property/${propertyId}`);
  return { ok: true };
}

/** Edits a property's own descriptive fields — address, ward/CDA, building & property type.
 *  Doesn't touch units or tenants; those have their own flows. Same authorization boundary
 *  as tenant management (admin or the property's own owner) since both are "manage this
 *  property's record" actions. */
export async function updatePropertyAction(propertyId, fields) {
  const cookieStore = await cookies();
  const supabase = createAdminClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const { data: property } = await supabase.from("properties").select("owner_id").eq("id", propertyId).single();
  if (!property) return { ok: false, error: "Property not found." };

  const isAdmin = profile?.role === "admin";
  const isOwner = profile?.role === "owner" && property.owner_id === user.id;
  if (!isAdmin && !isOwner) return { ok: false, error: "Not authorized." };

  const address = fields.address?.trim();
  if (!address) return { ok: false, error: "Address is required." };
  if (!fields.wardId || !fields.cdaId) return { ok: false, error: "Ward and CDA are required." };

  const { error: updateErr } = await supabase
    .from("properties")
    .update({
      address,
      ward_id: fields.wardId,
      cda_id: fields.cdaId,
      building_type: fields.buildingType,
      property_type: fields.propertyType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId);
  if (updateErr) return { ok: false, error: updateErr.message };

  await supabase.from("audit_log").insert({
    actor_id: user.id, actor_name: profile.full_name, actor_role: profile.role,
    action: "Updated property details", detail: address,
  });

  revalidatePath(`/registry/property/${propertyId}`);
  return { ok: true };
}
