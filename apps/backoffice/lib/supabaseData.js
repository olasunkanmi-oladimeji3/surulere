

/* ---------------------------------- Auth ---------------------------------- */

export async function signUpOwner(supabase, { fullName, email, phone, nin, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: "owner", full_name: fullName, phone, nin },
    },
  });
  if (error) return { ok: false, error: error.message };
  // If the Supabase project requires email confirmation, signUp() succeeds
  // but returns no session yet — the caller needs to know which happened.
  return { ok: true, user: data.user, session: data.session };
}

export async function signIn(supabase, { email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "We couldn't match that email and password. Check both and try again." };
  }
  return { ok: true, user: data.user };
}

export async function signOut(supabase) {
  await supabase.auth.signOut();
}

export async function updatePassword(supabase, newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Fetches the signed-in user's profile row plus their role-specific
 * extension row, merged into one object shaped close to what the rest of
 * the app expects from the old mock `user` (role, full_name/first_name/
 * last_name, email, phone, plus owner's nin / cda's ward_id / resident's
 * rich fields, depending on role).
 */
export async function fetchCurrentProfile(supabase) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();
  if (profileError || !profile) return null;

  if (profile.role === "owner") {
    const { data: owner } = await supabase.from("owners").select("*").eq("id", profile.id).single();
    return { ...profile, ...owner };
  }
  if (profile.role === "cda") {
    const { data: cda } = await supabase.from("cda_members").select("*").eq("id", profile.id).single();
    return { ...profile, ...cda };
  }
  if (profile.role === "resident") {
    const { data: resident } = await supabase.from("residents_view").select("*").eq("id", profile.id).single();
    return { ...profile, ...resident };
  }
  return profile; // admin — profiles row alone is enough (full_name, title)
}

/* -------------------------------- Reference data -------------------------------- */

export async function fetchWards(supabase) {
  const { data, error } = await supabase.from("wards").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchCdasForWard(supabase, wardId) {
  if (!wardId) return [];
  const { data, error } = await supabase.from("cdas").select("*").eq("ward_id", wardId).order("name");
  if (error) throw error;
  return data;
}

/* ---------------------------------- Properties ---------------------------------- */

export async function fetchOwnerProperties(supabase, ownerId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, units(*), wards(name, code)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPropertyById(supabase, propertyId) {
  const { data, error } = await supabase
    .from("properties")
    .select("*, units(*), domestic_staff(*)")
    .eq("id", propertyId)
    .single();
  if (error) return null;
  return data;
}

/**
 * Owner adds a property. `unitSpecs` is an array of
 * `{ occupancyType, tenancyType }`, one per unit — matches add_property()'s
 * p_unit_specs jsonb shape in supabase/migrations/0002_functions.sql.
 */
export async function addProperty(supabase, { ownerId, address, wardId, cdaId, buildingType, propertyType, unitSpecs, staff = [] }) {
  const { data, error } = await supabase.rpc("add_property", {
    p_owner_id: ownerId,
    p_address: address,
    p_ward_id: wardId,
    p_cda_id: cdaId,
    p_building_type: buildingType,
    p_property_type: propertyType,
    p_unit_specs: unitSpecs.map((u) => ({ occupancy_type: u.occupancyType || null, tenancy_type: u.tenancyType || null })),
    p_staff: staff,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, property: data };
}