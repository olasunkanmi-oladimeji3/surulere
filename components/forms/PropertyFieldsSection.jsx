"use client";

import useSWR from "swr";
import Icon from "@/components/Icon";
import { TextField, SelectField, labelOptions } from "./fieldKit";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWards, fetchCdasForWard } from "@/lib/supabaseData";
import {
  BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS, OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS,
  STAFF_ROLE_LABELS, GENDER_OPTIONS, NIGERIAN_STATES,
} from "@/lib/data";

export const emptyStaff = () => ({
  surname: "", first_name: "", last_name: "", phone: "", address: "",
  referee_name: "", referee_phone: "", referee_address: "", gender: "", age: "",
  state_of_origin: "", role_type: "domestic_staff",
});

export const initialPropertyForm = {
  address: "", wardId: "", cdaId: "",
  buildingType: "", propertyType: "",
  unitCount: 1, unitOccupancyType: "", unitTenancyType: "",
  hasDomesticStaff: false, domesticStaff: [],
};

/** Controlled section for a property's own details — address, ward/CDA
 *  cascade, building & property type, unit setup, and compound-wide
 *  domestic staff. Used as-is inside a bigger form (owner add-property,
 *  CDA register-property-for-owner).
 *
 *  Ward/CDA options are fetched live from Supabase (real UUIDs) rather than
 *  the static lib/wards.js list, whose IDs are made up locally and won't
 *  match any real `wards`/`cdas` row — see supabase/seed.sql. */
export default function PropertyFieldsSection({ form, setField, setForm }) {
  const { supabase, user } = useAuth();

  // Key includes user.id so SWR only fetches after a real session exists.
  // Without this, SWR fires the fetch immediately on first render (before
  // the Supabase session cookie is read), gets an empty result or RLS error,
  // caches it under the key "wards", and never retries because the key
  // never changes — leaving the ward dropdown permanently empty.
  const { data: wards, isLoading: wardsLoading, error: wardsError } = useSWR(
    user ? ["wards", user.id] : null,
    () => fetchWards(supabase)
  );
  const { data: cdaOptions, isLoading: cdasLoading } = useSWR(
    user && form.wardId ? ["cdas-for-ward", user.id, form.wardId] : null,
    () => fetchCdasForWard(supabase, form.wardId)
  );

  function updateStaff(i, key, value) {
    setForm((f) => {
      const staff = f.domesticStaff.slice();
      staff[i] = { ...staff[i], [key]: value };
      return { ...f, domesticStaff: staff };
    });
  }
  function addStaff() {
    setForm((f) => ({ ...f, domesticStaff: [...f.domesticStaff, emptyStaff()] }));
  }
  function removeStaff(i) {
    setForm((f) => ({ ...f, domesticStaff: f.domesticStaff.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-base text-ink font-semibold">Property</h2>
        <div className="mt-3">
          <TextField label="Address" required value={form.address} onChange={(v) => setField("address", v)} placeholder="e.g. 9 Aguda Close" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <SelectField
            label="Ward" required value={form.wardId} onChange={(v) => setField("wardId", v)}
            options={(wards || []).map((w) => ({ value: w.id, label: w.name }))}
            placeholder={wardsLoading ? "Loading wards…" : wardsError ? "Error loading wards" : "Select a ward"}
            disabled={wardsLoading || !!wardsError}
          />
          <SelectField
            label="CDA" required value={form.cdaId} onChange={(v) => setField("cdaId", v)}
            options={(cdaOptions || []).map((c) => ({ value: c.id, label: c.name }))}
            disabled={!form.wardId || cdasLoading}
            placeholder={!form.wardId ? "Choose a ward first" : cdasLoading ? "Loading CDAs…" : "Select a CDA"}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <SelectField label="Building type" required value={form.buildingType} onChange={(v) => setField("buildingType", v)} options={labelOptions(BUILDING_TYPE_LABELS)} />
          <SelectField label="Property type" required value={form.propertyType} onChange={(v) => setField("propertyType", v)} options={labelOptions(PROPERTY_TYPE_LABELS)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h2 className="font-display text-base text-ink font-semibold mt-4">Units</h2>
        <p className="text-sm text-muted mt-1">How many units, and what they&rsquo;re like. You can add the tenant for each one afterwards.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField
            label="Number of units" type="number" min="1" max="30" required
            value={form.unitCount} onChange={(v) => setField("unitCount", Math.max(1, parseInt(v, 10) || 1))}
          />
          <SelectField label="Occupancy type" required value={form.unitOccupancyType} onChange={(v) => setField("unitOccupancyType", v)} options={labelOptions(OCCUPANCY_TYPE_LABELS)} />
          {form.propertyType === "rented" && (
            <SelectField label="Tenancy type" required value={form.unitTenancyType} onChange={(v) => setField("unitTenancyType", v)} options={labelOptions(TENANCY_TYPE_LABELS)} />
          )}
        </div>
        <p className="text-xs text-muted mt-2">If units differ from each other, add them with the most common type for now — units can be corrected individually later.</p>
      </div>

      <div className="pt-1 border-t border-line">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.hasDomesticStaff} onChange={(e) => setField("hasDomesticStaff", e.target.checked)} />
          <span className="text-sm font-medium text-ink">There&rsquo;s domestic staff at this address (gateman, security, house help, etc.)</span>
        </label>

        {form.hasDomesticStaff && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Add each member of staff.</p>
              <button type="button" onClick={addStaff} className="btn-secondary text-sm shrink-0">
                <Icon name="plus" className="h-3.5 w-3.5" /> Add staff
              </button>
            </div>
            <div className="space-y-3 mt-3">
              {form.domesticStaff.map((s, i) => (
                <div key={i} className="card card-body bg-paper">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Staff {i + 1}</span>
                    <button type="button" onClick={() => removeStaff(i)} className="text-flagged text-xs font-medium hover:underline">Remove</button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <TextField label="Surname" required value={s.surname} onChange={(v) => updateStaff(i, "surname", v)} />
                    <TextField label="First name" required value={s.first_name} onChange={(v) => updateStaff(i, "first_name", v)} />
                    <TextField label="Middle name" value={s.last_name} onChange={(v) => updateStaff(i, "last_name", v)} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <SelectField label="Role" required value={s.role_type} onChange={(v) => updateStaff(i, "role_type", v)} options={labelOptions(STAFF_ROLE_LABELS)} />
                    <TextField label="Phone" type="tel" value={s.phone} onChange={(v) => updateStaff(i, "phone", v)} />
                    <SelectField label="Gender" value={s.gender} onChange={(v) => updateStaff(i, "gender", v)} options={GENDER_OPTIONS} capitalize />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <TextField label="Age" type="number" min="0" value={s.age} onChange={(v) => updateStaff(i, "age", v)} />
                    <SelectField label="State of origin" value={s.state_of_origin} onChange={(v) => updateStaff(i, "state_of_origin", v)} options={NIGERIAN_STATES} />
                    <TextField label="Address" value={s.address} onChange={(v) => updateStaff(i, "address", v)} />
                  </div>
                </div>
              ))}
              {form.domesticStaff.length === 0 && (
                <p className="text-sm text-muted italic">No staff added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}