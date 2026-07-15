export async function getCdaWardId(supabase, userId) {
  const { data } = await supabase.from("cda_members").select("ward_id").eq("id", userId).maybeSingle();
  return data?.ward_id ?? null;
}

const REAL_RESIDENT_SELECT = `
  id, resident_id, first_name, last_name, gender, status,
  properties ( id, property_number, address, ward_id, cda_id, owner_id, wards ( name ), cdas ( name ) )
`;

const FIELD_RESIDENT_SELECT = `
  id, resident_ref, first_name, last_name, gender, status, phone, is_head,
  properties ( id, property_number, address, ward_id, cda_id, owner_id, wards ( name ), cdas ( name ) )
`;

/** Unified, role-scoped resident list — real accounts + field-collected, merged. */
export async function getResidentsForViewer(supabase, profile) {
  let realQuery = supabase.from("residents").select(REAL_RESIDENT_SELECT).order("created_at", { ascending: false });
  let fieldQuery = supabase.from("field_residents").select(FIELD_RESIDENT_SELECT).order("created_at", { ascending: false });
  let cdaWardId = null;

  if (profile.role === "owner") {
    const { data: ownedProps } = await supabase.from("properties").select("id").eq("owner_id", profile.id);
    const ids = (ownedProps || []).map((p) => p.id);
    if (ids.length === 0) return [];
    realQuery = realQuery.in("property_id", ids);
    fieldQuery = null; // field-collected properties have no real owner_id link yet
  } else if (profile.role === "cda") {
    cdaWardId = await getCdaWardId(supabase, profile.id);
    if (!cdaWardId) return [];
  }
  // admin: unfiltered

  const [{ data: real, error: realErr }, fieldResult] = await Promise.all([
    realQuery,
    fieldQuery ? fieldQuery : Promise.resolve({ data: [] }),
  ]);
  if (realErr) throw realErr;
  const { data: field, error: fieldErr } = fieldResult;
  if (fieldErr) throw fieldErr;

  let combined = [
    ...(real || []).map((r) => ({
      id: r.id, type: "real", displayId: r.resident_id,
      first_name: r.first_name, last_name: r.last_name, gender: r.gender, status: r.status,
      property: r.properties,
    })),
    ...(field || []).map((r) => ({
      id: r.id, type: "field", displayId: r.resident_ref,
      first_name: r.first_name, last_name: r.last_name, gender: r.gender, status: r.status,
      property: r.properties,
    })),
  ];

  if (cdaWardId) combined = combined.filter((r) => r.property?.ward_id === cdaWardId);

  return combined;
}

/** Full profile — resident + household + unit + property + owner, for either data source. */
export async function getResidentDetail(supabase, id, type) {
  if (type === "field") {
    const { data, error } = await supabase
      .from("field_residents")
      .select(`
        id, resident_ref, first_name, last_name, phone, email, nin, date_of_birth, gender,
        marital_status, state_of_origin, occupation, is_head, unit_description, household_members, status, created_at,
        properties ( id, property_number, address, ward_id, cda_id, building_type, property_type, owner_id,
          wards ( name ), cdas ( name ),
          field_owners ( first_name, last_name, phone, nin ) )
      `)
      .eq("id", id).single();
    if (error) return null;
    return {
      type: "field", ...data,
      property: { ...data.properties, ward: data.properties.wards, cda: data.properties.cdas, owner: data.properties.field_owners },
      householdMembers: data.household_members || [],
    };
  }

  const { data, error } = await supabase
    .from("residents")
    .select(`
      id, resident_id, first_name, last_name, middle_name, date_of_birth, gender, marital_status,
      state_of_origin, alternative_phone, landmark, years_at_address, nin, voter_card_number,
      occupation, employment_status, employer_name, employer_address,
      emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
      disability, disability_type, chronic_illness, chronic_illness_type, status, created_at,
      profiles!residents_id_fkey ( phone, email ),
      units ( unit_number, occupancy_type, tenancy_type ),
      properties ( id, property_number, address, ward_id, cda_id, building_type, property_type, owner_id,
        wards ( name ), cdas ( name ),
        owners ( nin, profiles ( full_name, phone ) ) ),
      household_members ( id, first_name, last_name, other_names, gender, date_of_birth, age,
        relationship_to_head, phone, occupation, state_of_origin, nin )
    `)
    .eq("id", id).single();
  if (error) return null;

  return {
    type: "real", ...data,
    phone: data.profiles?.phone, email: data.profiles?.email,
    unit: data.units,
    property: { ...data.properties, ward: data.properties.wards, cda: data.properties.cdas, owner: data.properties.owners ? { ...data.properties.owners, ...data.properties.owners.profiles } : null },
    householdMembers: data.household_members || [],
  };
}

export async function computeResidentAccess(supabase, profile, resident) {
  const isAdmin = profile.role === "admin";
  const isOwnerOfThis = profile.role === "owner" && resident.property?.owner_id === profile.id;
  const isSelf = resident.type === "real" && resident.id === profile.id;

  let isAssignedCda = false;
  if (profile.role === "cda") {
    const wardId = await getCdaWardId(supabase, profile.id);
    isAssignedCda = !!wardId && wardId === resident.property?.ward_id;
  }

  return { hasAccess: isAdmin || isOwnerOfThis || isAssignedCda || isSelf };
}