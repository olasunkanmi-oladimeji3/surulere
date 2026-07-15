

// lib/queries/registry.js
const PROPERTY_SELECT = `
  id, property_number, address, ward_id, cda_id, building_type, property_type,
  owner_id, status, flag_note, created_at, property_images,
  wards ( id, name, code ),
  cdas ( id, name ),
  owners ( id, nin, profiles ( full_name, phone, email ) ),
  field_owners ( id, first_name, last_name, phone, nin ),
  units (
    id, unit_number, occupancy_type, tenancy_type,
    residents ( id, resident_id, first_name, last_name, status, profiles!residents_id_fkey ( phone ) )
  ),
  field_residents ( id, resident_ref, first_name, last_name, phone, is_head, status )
`;



function shapeProperty(p) {
  // Owner: prefer a real linked owner (once auth exists); fall back to field-collected data.
  const owner = p.owners
    ? { id: p.owners.id, nin: p.owners.nin, ...p.owners.profiles }
    : p.field_owners
    ? { full_name: `${p.field_owners.first_name} ${p.field_owners.last_name}`, phone: p.field_owners.phone, nin: p.field_owners.nin, isFieldRecord: true }
    : null;

  // Units: real properties have them; field-collected ones don't yet, so
  // synthesize a single "occupants" list from field_residents instead.
  const units = p.units.length > 0
    ? p.units.map((u) => ({
        ...u,
        occupancy: u.residents.length > 0 ? "occupied" : "vacant",
        tenant: u.residents[0] ? { ...u.residents[0], phone: u.residents[0].profiles?.phone } : null,
      }))
    : [];

  return {
    ...p,
    owner,
    ward: p.wards,
    cda: p.cdas,
    units,
    fieldResidents: p.field_residents || [], // occupants collected via the field form, no unit assigned
  };
}


export async function getProfile(supabase, userId) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function getWards(supabase) {
  const { data } = await supabase.from("wards").select("id, name, code").order("name");
  return data ?? [];
}

export async function getCdas(supabase) {
  const { data } = await supabase.from("cdas").select("id, name, ward_id").order("name");
  return data ?? [];
}

// Full property record with owner name, ward/cda, units + who occupies them.

export async function getProperties(supabase) {
  const { data, error } = await supabase.from("properties").select(PROPERTY_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(shapeProperty);
}

export async function getPropertyById(supabase, id) {
  const { data, error } = await supabase.from("properties").select(PROPERTY_SELECT).eq("id", id).single();
  if (error) {
    console.error("getPropertyById error:", error.message, error.details, error.hint);
    return null;
  }
  return shapeProperty(data);
}

export async function getDashboardCounts(supabase) {
  const [
    { count: verified }, { count: pending }, { count: flagged },
    { count: owners }, { count: residents }, { count: cdaMembers }, { count: admins },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "verified"),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "flagged"),
    supabase.from("owners").select("*", { count: "exact", head: true }),
    supabase.from("residents").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cda"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
  ]);
  return { verified, pending, flagged, owners, residents, cdaMembers, admins };
}

// lib/queries/registry.js — replace the existing getAllResidentsWithContext
export async function getAllResidentsWithContext(supabase) {
  const { data, error } = await supabase
    .from("residents")
    .select(`
      id, resident_id, first_name, last_name, gender, status, property_id,
      properties ( id, property_number, address, ward_id, cda_id )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// lib/queries/registry.js — add these
export async function getVerificationLogs(supabase, propertyId) {
  const { data, error } = await supabase
    .from("verification_logs")
    .select("id, outcome, note, created_at, profiles ( full_name )")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function computeAccess(supabase, profile, property) {
  const isAdmin = profile.role === "admin";
  const isOwnerOfThis = profile.role === "owner" && property.owner_id === profile.id;

  let isAssignedCda = false;
  if (profile.role === "cda") {
    const { data } = await supabase
      .from("cda_members")
      .select("ward_id")
      .eq("id", profile.id)
      .eq("ward_id", property.ward_id)
      .maybeSingle();
    isAssignedCda = !!data;
  }

  const isTenantHere =
    profile.role === "resident" &&
    property.units.some((u) => u.tenant?.id === profile.id);

  return {
    isAdmin, isOwnerOfThis, isAssignedCda, isTenantHere,
    hasAccess: isAdmin || isOwnerOfThis || isAssignedCda || isTenantHere,
    canManageTenants: isOwnerOfThis || isAdmin,
    canLogVisit: isAssignedCda || isAdmin,
  };
}

// lib/queries/registry.js — add
export async function getCdaMembers(supabase) {
  const { data, error } = await supabase
    .from("cda_members")
    .select(`
      id, ward_id, added_by, created_at,
      profiles!cda_members_id_fkey ( full_name, email, phone ),
      wards ( id, name, code )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((m) => ({
    id: m.id, ward_id: m.ward_id, created_at: m.created_at,
    name: m.profiles?.full_name, email: m.profiles?.email, phone: m.profiles?.phone,
    ward: m.wards,
  }));
}
// add
export async function getAuditLog(supabase) {
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, actor_id, actor_name, actor_role, action, detail, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}