import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const {
    agentName, agentPhone, wardId, cdaId,
    address, buildingType, propertyType,
    ownerFirstName, ownerLastName, ownerPhone, ownerNin,
    imageUrls = [],
    residents = [],
  } = body;

  const missing = [];
  if (!agentName?.trim())        missing.push("Agent name");
  if (!agentPhone?.trim())       missing.push("Agent phone");
  if (!wardId)                   missing.push("Ward");
  if (!cdaId)                    missing.push("CDA");
  if (!address?.trim())          missing.push("Property address");
  if (!buildingType)             missing.push("Building type");
  if (!propertyType)             missing.push("Property type");
  if (!ownerFirstName?.trim())   missing.push("Owner first name");
  if (!ownerLastName?.trim())    missing.push("Owner last name");
  if (!ownerPhone?.trim())       missing.push("Owner phone");
  if (residents.length === 0)    missing.push("At least one resident");

  for (const [i, r] of residents.entries()) {
    const n = `Resident ${i + 1}`;
    if (!r.firstName?.trim()) missing.push(`${n} first name`);
    if (!r.lastName?.trim())  missing.push(`${n} last name`);
    if (!r.phone?.trim())     missing.push(`${n} phone`);
  }

  if (missing.length) {
    return NextResponse.json({ error: `Missing: ${missing.join(", ")}.` }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: ward } = await supabase.from("wards").select("code").eq("id", wardId).single();
  if (!ward) return NextResponse.json({ error: "Ward not found." }, { status: 400 });

  const { data: propertyNumber, error: numErr } = await supabase
    .rpc("next_property_number", { p_ward_code: ward.code });
  if (numErr) return NextResponse.json({ error: "Failed to generate property number." }, { status: 500 });

  // app/api/field/submit/route.js
// ...unchanged validation above...

const { data: property, error: propErr } = await supabase
  .from("properties")
  .insert({
    property_number: propertyNumber,
    address: address.trim(),
    ward_id: wardId,
    cda_id: cdaId,
    building_type: buildingType,
    property_type: propertyType,
    owner_id: null, // no real `owners` row yet — auth comes later
    registered_by: null,
    registered_by_role: "cda",
    status: "pending",
    field_agent_name: agentName.trim(),
    field_agent_phone: agentPhone.trim(),
    property_images: imageUrls,
  })
  .select()
  .single();

if (propErr) return NextResponse.json({ error: propErr.message }, { status: 500 });

// NEW — save the owner data that was previously being dropped
const { error: ownerErr } = await supabase.from("field_owners").insert({
  property_id: property.id,
  first_name: ownerFirstName.trim(),
  last_name: ownerLastName.trim(),
  phone: ownerPhone.trim(),
  nin: ownerNin?.trim() || null,
});
if (ownerErr) {
  await supabase.from("properties").delete().eq("id", property.id);
  return NextResponse.json({ error: `Owner info: ${ownerErr.message}` }, { status: 500 });
}

// ...rest unchanged (residentRefs loop, audit_log insert)...

  if (propErr) return NextResponse.json({ error: propErr.message }, { status: 500 });

  const residentRefs = [];
  for (const [i, r] of residents.entries()) {
    const residentRef = `${propertyNumber}-R${String(i + 1).padStart(2, "0")}`;
    residentRefs.push(residentRef);

    const { error: resErr } = await supabase.from("field_residents").insert({
      resident_ref: residentRef,
      property_id: property.id,
      first_name: r.firstName.trim(),
      last_name: r.lastName.trim(),
      phone: r.phone.trim(),
      email: r.email?.trim() || null,
      nin: r.nin?.trim() || null,
      date_of_birth: r.dateOfBirth || null,
      gender: r.gender || null,
      marital_status: r.maritalStatus || null,
      state_of_origin: r.stateOfOrigin || null,
      occupation: r.occupation || null,
      is_head: !!r.isHead,
      unit_description: r.unitDescription?.trim() || null,
      household_members: r.householdMembers || [],
      status: "pending",
    });

    if (resErr) {
      await supabase.from("properties").delete().eq("id", property.id);
      return NextResponse.json({ error: `Resident ${i + 1}: ${resErr.message}` }, { status: 500 });
    }
  }

  await supabase.from("audit_log").insert({
    actor_id: null,
    actor_name: `${agentName.trim()} (field form)`,
    actor_role: "cda",
    action: "Field form submitted",
    detail: `${propertyNumber} — ${address.trim()} — ${residents.length} resident(s)`,
  });

  return NextResponse.json({ ok: true, propertyNumber, residentRefs, propertyId: property.id });
}