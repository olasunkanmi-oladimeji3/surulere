"use client";

import { useState, useRef } from "react";
import { addTenantToUnit } from "@/lib/data";
import { sendWelcomeEmail } from "@/lib/email";
import {
  GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS,
  RELATIONSHIP_TO_HEAD_OPTIONS, NIGERIAN_STATES,
} from "@/lib/data";
import { TextField, SelectField, FileField, ReviewItem, fileToDataUrlIfSmall } from "./fieldKit";
import Icon from "@/components/Icon";

const STEPS = ["Personal & contact", "Identification", "Household", "Employment, emergency & health", "Documents & review"];

const emptyMember = () => ({
  first_name: "", last_name: "", other_names: "", gender: "", date_of_birth: "",
  age: "", relationship_to_head: "", phone: "", occupation: "", state_of_origin: "", nin: "",
});

const initialForm = {
  firstName: "", lastName: "", middleName: "", dateOfBirth: "", gender: "", maritalStatus: "", stateOfOrigin: "",
  email: "", phone: "", alternativePhone: "", landmark: "", yearsAtAddress: "",
  nin: "", voterCardNumber: "",
  householdMembers: [],
  occupation: "", employmentStatus: "", employerName: "", employerAddress: "",
  emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
  disability: false, disabilityType: "", chronicIllness: false, chronicIllnessType: "",
  photo: null, idDocument: null, proofOfResidence: null,
};

/** Adds a tenant to a specific unit. Tenants never fill this out themselves
 *  — the owner (or LG Staff) does, then the tenant is emailed their login. */
export default function TenantForm({ propertyId, unitId, unitLabel, actorId, onDone, onCancel }) {
  const formRef = useRef(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function goNext() {
    if (formRef.current && !formRef.current.reportValidity()) return;
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) return;
    setError("");
    setSubmitting(true);

    try {
      let photoDataUrl;
      if (form.photo) photoDataUrl = await fileToDataUrlIfSmall(form.photo);

      const result = addTenantToUnit(actorId, propertyId, unitId, {
        ...form,
        photoDataUrl,
        idDocumentName: form.idDocument?.name,
        proofOfResidenceName: form.proofOfResidence?.name,
      });

      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      const { message } = await sendWelcomeEmail({
        to: result.tenant.email,
        name: `${result.tenant.first_name} ${result.tenant.last_name}`,
        idLabel: "Resident ID", idValue: result.tenant.resident_id,
        tempPassword: result.tempPassword,
        intro: "Your landlord has added you to Ilé Surulere, the Surulere LG community registry, for your unit.",
      });

      onDone(result.tenant, message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted mb-5">
        Adding the tenant for <span className="font-mono font-medium text-ink">{unitLabel}</span>.
        They&rsquo;ll be emailed their own Resident ID and a temporary password once this is submitted.
      </p>

      <ol className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2 shrink-0">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${i === step ? "bg-ink text-on-ink" : i < step ? "bg-verified text-on-ink" : "bg-line text-muted"}`}>
              {i < step ? <Icon name="check" className="h-3 w-3" /> : i + 1}
            </span>
            <span className={`text-xs ${i === step ? "text-ink font-medium" : "text-muted"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-4 h-px bg-line" />}
          </li>
        ))}
      </ol>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {step === 0 && <PersonalContactStep form={form} setField={setField} />}
        {step === 1 && <IdentificationStep form={form} setField={setField} />}
        {step === 2 && <HouseholdStep form={form} setForm={setForm} />}
        {step === 3 && <EmploymentEmergencyHealthStep form={form} setField={setField} />}
        {step === 4 && <DocumentsReviewStep form={form} setField={setField} />}

        {error && <p className="field-error">{error}</p>}

        <div className="flex gap-2.5 pt-2 border-t border-line">
          <button type="button" onClick={step === 0 ? onCancel : goBack} className="btn-secondary">
            {step === 0 ? "Cancel" : (<><Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back</>)}
          </button>
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary">Continue</button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Submitting…" : "Add tenant"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function PersonalContactStep({ form, setField }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base text-ink font-semibold">Personal details</h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="First name" required value={form.firstName} onChange={(v) => setField("firstName", v)} />
          <TextField label="Last name" required value={form.lastName} onChange={(v) => setField("lastName", v)} />
          <TextField label="Middle name" value={form.middleName} onChange={(v) => setField("middleName", v)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => setField("dateOfBirth", v)} />
          <SelectField label="Gender" required value={form.gender} onChange={(v) => setField("gender", v)} options={GENDER_OPTIONS} capitalize />
          <SelectField label="Marital status" value={form.maritalStatus} onChange={(v) => setField("maritalStatus", v)} options={MARITAL_STATUS_OPTIONS} />
        </div>
        <div className="mt-3 max-w-xs">
          <SelectField label="State of origin" value={form.stateOfOrigin} onChange={(v) => setField("stateOfOrigin", v)} options={NIGERIAN_STATES} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Contact</h3>
        <p className="text-sm text-muted mt-1">Their login details get emailed to the address below.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Email address" type="email" required value={form.email} onChange={(v) => setField("email", v)} />
          <TextField label="Phone number" type="tel" required value={form.phone} onChange={(v) => setField("phone", v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Alternative phone" type="tel" value={form.alternativePhone} onChange={(v) => setField("alternativePhone", v)} />
          <TextField label="Years at this address" type="number" min="0" value={form.yearsAtAddress} onChange={(v) => setField("yearsAtAddress", v)} />
        </div>
        <div className="mt-3">
          <TextField label="Landmark" value={form.landmark} onChange={(v) => setField("landmark", v)} placeholder="e.g. opposite the bus stop" />
        </div>
      </div>
    </div>
  );
}

function IdentificationStep({ form, setField }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <TextField label="NIN" required mono maxLength={11} inputMode="numeric" value={form.nin} onChange={(v) => setField("nin", v)} placeholder="11 digits" />
      <TextField label="Voter's card number" mono value={form.voterCardNumber} onChange={(v) => setField("voterCardNumber", v)} />
    </div>
  );
}

function HouseholdStep({ form, setForm }) {
  function updateMember(i, key, value) {
    setForm((f) => {
      const members = f.householdMembers.slice();
      members[i] = { ...members[i], [key]: value };
      return { ...f, householdMembers: members };
    });
  }
  function addMember() {
    setForm((f) => ({ ...f, householdMembers: [...f.householdMembers, emptyMember()] }));
  }
  function removeMember(i) {
    setForm((f) => ({ ...f, householdMembers: f.householdMembers.filter((_, idx) => idx !== i) }));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base text-ink font-semibold">Other household members</h3>
          <p className="text-sm text-muted mt-1">Anyone else living in this unit — spouse, children, relatives.</p>
        </div>
        <button type="button" onClick={addMember} className="btn-secondary text-sm shrink-0">
          <Icon name="plus" className="h-3.5 w-3.5" /> Add member
        </button>
      </div>

      <div className="space-y-3 mt-3">
        {form.householdMembers.map((m, i) => (
          <div key={i} className="card card-body bg-paper">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Member {i + 1}</span>
              <button type="button" onClick={() => removeMember(i)} className="text-flagged text-xs font-medium hover:underline">Remove</button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField label="First name" required value={m.first_name} onChange={(v) => updateMember(i, "first_name", v)} />
              <TextField label="Last name" required value={m.last_name} onChange={(v) => updateMember(i, "last_name", v)} />
              <TextField label="Other names" value={m.other_names} onChange={(v) => updateMember(i, "other_names", v)} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              <SelectField label="Gender" value={m.gender} onChange={(v) => updateMember(i, "gender", v)} options={GENDER_OPTIONS} capitalize />
              <TextField label="Age" type="number" min="0" value={m.age} onChange={(v) => updateMember(i, "age", v)} />
              <SelectField label="Relationship to tenant" value={m.relationship_to_head} onChange={(v) => updateMember(i, "relationship_to_head", v)} options={RELATIONSHIP_TO_HEAD_OPTIONS} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              <TextField label="Phone" type="tel" value={m.phone} onChange={(v) => updateMember(i, "phone", v)} />
              <TextField label="Occupation" value={m.occupation} onChange={(v) => updateMember(i, "occupation", v)} />
              <SelectField label="State of origin" value={m.state_of_origin} onChange={(v) => updateMember(i, "state_of_origin", v)} options={NIGERIAN_STATES} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              <TextField label="NIN" mono maxLength={11} inputMode="numeric" value={m.nin} onChange={(v) => updateMember(i, "nin", v)} />
            </div>
          </div>
        ))}
        {form.householdMembers.length === 0 && (
          <p className="text-sm text-muted italic">No other members added.</p>
        )}
      </div>
    </div>
  );
}

function EmploymentEmergencyHealthStep({ form, setField }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base text-ink font-semibold">Employment</h3>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Occupation" value={form.occupation} onChange={(v) => setField("occupation", v)} />
          <SelectField label="Employment status" value={form.employmentStatus} onChange={(v) => setField("employmentStatus", v)} options={EMPLOYMENT_STATUS_OPTIONS} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Employer name" value={form.employerName} onChange={(v) => setField("employerName", v)} />
          <TextField label="Employer address" value={form.employerAddress} onChange={(v) => setField("employerAddress", v)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Emergency contact</h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="Name" required value={form.emergencyContactName} onChange={(v) => setField("emergencyContactName", v)} />
          <SelectField label="Relationship" value={form.emergencyContactRelationship} onChange={(v) => setField("emergencyContactRelationship", v)} options={RELATIONSHIP_TO_HEAD_OPTIONS} />
          <TextField label="Phone" type="tel" required value={form.emergencyContactPhone} onChange={(v) => setField("emergencyContactPhone", v)} />
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
            <TextField label="Disability — please specify" value={form.disabilityType} onChange={(v) => setField("disabilityType", v)} />
          </div>
        )}
        <label className="flex items-center gap-2.5 cursor-pointer mt-3">
          <input type="checkbox" checked={form.chronicIllness} onChange={(e) => setField("chronicIllness", e.target.checked)} />
          <span className="text-sm text-ink">Living with a chronic illness</span>
        </label>
        {form.chronicIllness && (
          <div className="mt-2 max-w-sm">
            <TextField label="Chronic illness — please specify" value={form.chronicIllnessType} onChange={(v) => setField("chronicIllnessType", v)} />
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsReviewStep({ form, setField }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base text-ink font-semibold">Documents</h3>
        <p className="text-sm text-muted mt-1">Optional, but they help LG Staff process the record faster.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <FileField label="Photo" accept="image/*" value={form.photo} onChange={(f) => setField("photo", f)} />
          <FileField label="ID document" accept="image/*,.pdf" value={form.idDocument} onChange={(f) => setField("idDocument", f)} />
          <FileField label="Proof of residence" accept="image/*,.pdf" value={form.proofOfResidence} onChange={(f) => setField("proofOfResidence", f)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h3 className="font-display text-base text-ink font-semibold mt-4">Review</h3>
        <div className="card bg-paper mt-3">
          <div className="card-body grid sm:grid-cols-2 gap-4 text-sm">
            <ReviewItem label="Name" value={`${form.firstName} ${form.lastName}`} />
            <ReviewItem label="Email" value={form.email} />
            <ReviewItem label="Phone" value={form.phone} />
            <ReviewItem label="NIN" value={form.nin} />
            <ReviewItem label="Household members" value={String(form.householdMembers.length)} />
          </div>
        </div>
        <p className="text-xs text-muted mt-2">
          Submitting will create a Resident ID and email login details to <strong>{form.email || "the email above"}</strong>.
        </p>
      </div>
    </div>
  );
}
