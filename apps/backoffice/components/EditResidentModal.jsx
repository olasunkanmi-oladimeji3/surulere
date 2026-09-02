"use client";

import { useState } from "react";
import Modal from "./Modal";
import { TextField, SelectField } from "./forms/fieldKit";
import { updateResidentAction } from "@/lib/actions/residents";
import {
  GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS,
  RELATIONSHIP_TO_HEAD_OPTIONS, NIGERIAN_STATES,
} from "@/lib/data";

export default function EditResidentModal({ open, onClose, resident, onSaved }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit resident" size="lg">
      <EditResidentForm key={open ? "open" : "closed"} resident={resident} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function EditResidentForm({ resident, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: resident.first_name || "",
    last_name: resident.last_name || "",
    middle_name: resident.middle_name || "",
    date_of_birth: resident.date_of_birth || "",
    gender: resident.gender || "",
    marital_status: resident.marital_status || "",
    state_of_origin: resident.state_of_origin || "",
    alternative_phone: resident.alternative_phone || "",
    landmark: resident.landmark || "",
    years_at_address: resident.years_at_address || "",
    nin: resident.nin || "",
    voter_card_number: resident.voter_card_number || "",
    occupation: resident.occupation || "",
    employment_status: resident.employment_status || "",
    employer_name: resident.employer_name || "",
    employer_address: resident.employer_address || "",
    emergency_contact_name: resident.emergency_contact_name || "",
    emergency_contact_relationship: resident.emergency_contact_relationship || "",
    emergency_contact_phone: resident.emergency_contact_phone || "",
    disability: !!resident.disability,
    disability_type: resident.disability_type || "",
    chronic_illness: !!resident.chronic_illness,
    chronic_illness_type: resident.chronic_illness_type || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await updateResidentAction(resident.id, form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved?.();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-base text-ink font-semibold">Personal</h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="First name" required value={form.first_name} onChange={(v) => setField("first_name", v)} />
          <TextField label="Last name" required value={form.last_name} onChange={(v) => setField("last_name", v)} />
          <TextField label="Middle name" value={form.middle_name} onChange={(v) => setField("middle_name", v)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => setField("date_of_birth", v)} />
          <SelectField label="Gender" value={form.gender} onChange={(v) => setField("gender", v)} options={GENDER_OPTIONS} capitalize />
          <SelectField label="Marital status" value={form.marital_status} onChange={(v) => setField("marital_status", v)} options={MARITAL_STATUS_OPTIONS} />
        </div>
        <div className="mt-3 max-w-xs">
          <SelectField label="State of origin" value={form.state_of_origin} onChange={(v) => setField("state_of_origin", v)} options={NIGERIAN_STATES} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Identification &amp; contact</h3>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="NIN" mono maxLength={11} inputMode="numeric" value={form.nin} onChange={(v) => setField("nin", v.replace(/\D/g, ""))} placeholder="11 digits" />
          <TextField label="Voter's card number" mono value={form.voter_card_number} onChange={(v) => setField("voter_card_number", v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Alternative phone" type="tel" value={form.alternative_phone} onChange={(v) => setField("alternative_phone", v)} />
          <TextField label="Years at this address" type="number" min="0" value={form.years_at_address} onChange={(v) => setField("years_at_address", v)} />
        </div>
        <div className="mt-3">
          <TextField label="Landmark" value={form.landmark} onChange={(v) => setField("landmark", v)} placeholder="e.g. opposite the bus stop" />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Employment</h3>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Occupation" value={form.occupation} onChange={(v) => setField("occupation", v)} />
          <SelectField label="Employment status" value={form.employment_status} onChange={(v) => setField("employment_status", v)} options={EMPLOYMENT_STATUS_OPTIONS} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Employer name" value={form.employer_name} onChange={(v) => setField("employer_name", v)} />
          <TextField label="Employer address" value={form.employer_address} onChange={(v) => setField("employer_address", v)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Emergency contact</h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="Name" value={form.emergency_contact_name} onChange={(v) => setField("emergency_contact_name", v)} />
          <SelectField label="Relationship" value={form.emergency_contact_relationship} onChange={(v) => setField("emergency_contact_relationship", v)} options={RELATIONSHIP_TO_HEAD_OPTIONS} />
          <TextField label="Phone" type="tel" value={form.emergency_contact_phone} onChange={(v) => setField("emergency_contact_phone", v)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Health</h3>
        <label className="flex items-center gap-2.5 cursor-pointer mt-2">
          <input type="checkbox" checked={form.disability} onChange={(e) => setField("disability", e.target.checked)} />
          <span className="text-sm text-ink">Living with a disability</span>
        </label>
        {form.disability && (
          <div className="mt-2 max-w-sm">
            <TextField label="Disability — please specify" value={form.disability_type} onChange={(v) => setField("disability_type", v)} />
          </div>
        )}
        <label className="flex items-center gap-2.5 cursor-pointer mt-3">
          <input type="checkbox" checked={form.chronic_illness} onChange={(e) => setField("chronic_illness", e.target.checked)} />
          <span className="text-sm text-ink">Living with a chronic illness</span>
        </label>
        {form.chronic_illness && (
          <div className="mt-2 max-w-sm">
            <TextField label="Chronic illness — please specify" value={form.chronic_illness_type} onChange={(v) => setField("chronic_illness_type", v)} />
          </div>
        )}
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
