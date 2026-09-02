"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "./Modal";
import { TextField, SelectField, labelOptions } from "./forms/fieldKit";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWards, fetchCdasForWard } from "@/lib/supabaseData";
import { updatePropertyAction } from "@/lib/actions/properties";
import { BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/data";

export default function EditPropertyModal({ open, onClose, property, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit property" size="lg">
      <EditPropertyForm key={open ? "open" : "closed"} property={property} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function EditPropertyForm({ property, onClose, onSaved }) {
  const { supabase, user } = useAuth();
  const [form, setForm] = useState({
    address: property.address || "",
    wardId: property.ward_id || "",
    cdaId: property.cda_id || "",
    buildingType: property.building_type || "",
    propertyType: property.property_type || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: wards, isLoading: wardsLoading, error: wardsError } = useSWR(
    user ? ["wards", user.id] : null,
    () => fetchWards(supabase)
  );
  const { data: cdaOptions, isLoading: cdasLoading } = useSWR(
    user && form.wardId ? ["cdas-for-ward", user.id, form.wardId] : null,
    () => fetchCdasForWard(supabase, form.wardId)
  );

  function setField(name, value) {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "wardId" && value !== f.wardId) next.cdaId = "";
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await updatePropertyAction(property.id, form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved?.();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField label="Address" required value={form.address} onChange={(v) => setField("address", v)} placeholder="e.g. 9 Aguda Close" />

      <div className="grid sm:grid-cols-2 gap-3">
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

      <div className="grid sm:grid-cols-2 gap-3">
        <SelectField label="Building type" required value={form.buildingType} onChange={(v) => setField("buildingType", v)} options={labelOptions(BUILDING_TYPE_LABELS)} />
        <SelectField label="Property type" required value={form.propertyType} onChange={(v) => setField("propertyType", v)} options={labelOptions(PROPERTY_TYPE_LABELS)} />
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="flex gap-2.5 pt-2 border-t border-line">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
