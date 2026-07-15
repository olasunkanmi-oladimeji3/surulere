"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { sendWelcomeEmail } from "@/lib/email";
import {
  WARDS, getCdasForWard,
  BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS, OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS,
  STAFF_ROLE_LABELS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EMPLOYMENT_STATUS_OPTIONS,
  RELATIONSHIP_TO_HEAD_OPTIONS, NIGERIAN_STATES,
} from "@/lib/data";
import Icon from "@/components/Icon";

const STEPS = ["Personal & contact", "Identification & property", "Household & staff", "Employment, emergency & health", "Documents & review"];

const emptyMember = () => ({
  first_name: "", last_name: "", other_names: "", gender: "", date_of_birth: "",
  age: "", relationship_to_head: "", phone: "", occupation: "", state_of_origin: "", nin: "",
});

const emptyStaff = () => ({
  surname: "", first_name: "", last_name: "", phone: "", address: "",
  referee_name: "", referee_phone: "", referee_address: "", gender: "", age: "",
  state_of_origin: "", role_type: "domestic_staff",
});

const initialForm = {
  firstName: "", lastName: "", middleName: "", dateOfBirth: "", gender: "", maritalStatus: "", stateOfOrigin: "",
  email: "", phone: "", alternativePhone: "", address: "", wardId: "", cdaId: "", landmark: "", yearsAtAddress: "",
  nin: "", voterCardNumber: "",
  buildingType: "", propertyType: "", occupancyType: "", tenancyType: "", householdSize: "", numberOfChildren: "",
  householdMembers: [],
  hasDomesticStaff: false, domesticStaff: [],
  occupation: "", employmentStatus: "", employerName: "", employerAddress: "",
  emergencyContactName: "", emergencyContactRelationship: "", emergencyContactPhone: "",
  disability: false, disabilityType: "", chronicIllness: false, chronicIllnessType: "",
  photo: null, idDocument: null, proofOfResidence: null,
};

export default function RegistrationForm() {
  const { registerResident } = useAuth();
  const router = useRouter();
  const formRef = useRef(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { resident, tempPassword, message } once submitted

  function setField(name, value) {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "wardId") next.cdaId = ""; // ward changed — CDA choice no longer valid
      if (name === "propertyType" && value !== "rented") next.tenancyType = "";
      return next;
    });
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
      if (form.photo) {
        photoDataUrl = await fileToDataUrlIfSmall(form.photo);
      }

      const result_ = registerResident({
        ...form,
        photoDataUrl,
        idDocumentName: form.idDocument?.name,
        proofOfResidenceName: form.proofOfResidence?.name,
      });

      if (!result_.ok) {
        setError(result_.error);
        setSubmitting(false);
        return;
      }

      const { message } = await sendWelcomeEmail({
        to: result_.resident.email,
        name: `${result_.resident.first_name} ${result_.resident.last_name}`,
        residentId: result_.resident.resident_id,
        tempPassword: result_.tempPassword,
        registeredByNote: "Someone registered this household on Ilé Surulere — if that wasn't you personally, no problem; these are your own login details.",
      });

      setResult({ resident: result_.resident, tempPassword: result_.tempPassword, message });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) return <ConfirmationScreen result={result} onContinue={() => router.push("/dashboard/resident")} />;

  return (
    <div>
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

      <form ref={formRef} onSubmit={handleSubmit} className="card card-body space-y-5">
        {step === 0 && <PersonalContactStep form={form} setField={setField} />}
        {step === 1 && <IdentificationPropertyStep form={form} setField={setField} />}
        {step === 2 && <HouseholdStaffStep form={form} setField={setField} setForm={setForm} />}
        {step === 3 && <EmploymentEmergencyHealthStep form={form} setField={setField} />}
        {step === 4 && <DocumentsReviewStep form={form} setField={setField} />}

        {error && <p className="field-error">{error}</p>}

        <div className="flex gap-2.5 pt-2 border-t border-line">
          {step > 0 && (
            <button type="button" onClick={goBack} className="btn-secondary">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary">Continue</button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Submitting…" : "Submit registration"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ----------------------------- Step 1 ----------------------------- */

function PersonalContactStep({ form, setField }) {
  const cdaOptions = form.wardId ? getCdasForWard(form.wardId) : [];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-base text-ink font-semibold">Personal details</h2>
        <p className="text-sm text-muted mt-1">Who&rsquo;s being registered.</p>
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
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <SelectField label="State of origin" value={form.stateOfOrigin} onChange={(v) => setField("stateOfOrigin", v)} options={NIGERIAN_STATES} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h2 className="font-display text-base text-ink font-semibold mt-4">Contact</h2>
        <p className="text-sm text-muted mt-1">
          Login details get emailed to the address below — if you&rsquo;re registering someone
          else (a tenant, a relative), use <em>their</em> email and phone, not yours.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Email address" type="email" required value={form.email} onChange={(v) => setField("email", v)} />
          <TextField label="Phone number" type="tel" required value={form.phone} onChange={(v) => setField("phone", v)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Alternative phone" type="tel" value={form.alternativePhone} onChange={(v) => setField("alternativePhone", v)} />
          <TextField label="Years at this address" type="number" min="0" value={form.yearsAtAddress} onChange={(v) => setField("yearsAtAddress", v)} />
        </div>
        <div className="mt-3">
          <TextField label="Address" required value={form.address} onChange={(v) => setField("address", v)} />
        </div>
        <div className="mt-3">
          <TextField label="Landmark" value={form.landmark} onChange={(v) => setField("landmark", v)} placeholder="e.g. opposite the bus stop" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <SelectField
            label="Ward" required value={form.wardId} onChange={(v) => setField("wardId", v)}
            options={WARDS.map((w) => ({ value: w.id, label: w.name }))}
          />
          <SelectField
            label="CDA" required value={form.cdaId} onChange={(v) => setField("cdaId", v)}
            options={cdaOptions.map((c) => ({ value: c.id, label: c.name }))}
            disabled={!form.wardId}
            placeholder={form.wardId ? "Select a CDA" : "Choose a ward first"}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Step 2 ----------------------------- */

function IdentificationPropertyStep({ form, setField }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-base text-ink font-semibold">Identification</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="NIN" required mono maxLength={11} inputMode="numeric" value={form.nin} onChange={(v) => setField("nin", v)} placeholder="11 digits" />
          <TextField label="Voter's card number" mono value={form.voterCardNumber} onChange={(v) => setField("voterCardNumber", v)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h2 className="font-display text-base text-ink font-semibold mt-4">Property & household</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <SelectField label="Building type" required value={form.buildingType} onChange={(v) => setField("buildingType", v)} options={labelOptions(BUILDING_TYPE_LABELS)} />
          <SelectField label="Property type" required value={form.propertyType} onChange={(v) => setField("propertyType", v)} options={labelOptions(PROPERTY_TYPE_LABELS)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <SelectField label="Occupancy type" required value={form.occupancyType} onChange={(v) => setField("occupancyType", v)} options={labelOptions(OCCUPANCY_TYPE_LABELS)} />
          {form.propertyType === "rented" && (
            <SelectField label="Tenancy type" required value={form.tenancyType} onChange={(v) => setField("tenancyType", v)} options={labelOptions(TENANCY_TYPE_LABELS)} />
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <TextField label="Household size" type="number" min="1" value={form.householdSize} onChange={(v) => setField("householdSize", v)} />
          <TextField label="Number of children" type="number" min="0" value={form.numberOfChildren} onChange={(v) => setField("numberOfChildren", v)} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Step 3 ----------------------------- */

function HouseholdStaffStep({ form, setField, setForm }) {
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base text-ink font-semibold">Other household members</h2>
            <p className="text-sm text-muted mt-1">Anyone else living here — spouse, children, relatives. Skip this if it&rsquo;s just the person above.</p>
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
                <SelectField label="Relationship to head" value={m.relationship_to_head} onChange={(v) => updateMember(i, "relationship_to_head", v)} options={RELATIONSHIP_TO_HEAD_OPTIONS} />
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
                  <p className="text-xs text-muted uppercase tracking-wide mt-3">Referee</p>
                  <div className="grid sm:grid-cols-3 gap-3 mt-2">
                    <TextField label="Referee name" value={s.referee_name} onChange={(v) => updateStaff(i, "referee_name", v)} />
                    <TextField label="Referee phone" type="tel" value={s.referee_phone} onChange={(v) => updateStaff(i, "referee_phone", v)} />
                    <TextField label="Referee address" value={s.referee_address} onChange={(v) => updateStaff(i, "referee_address", v)} />
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

/* ----------------------------- Step 4 ----------------------------- */

function EmploymentEmergencyHealthStep({ form, setField }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-base text-ink font-semibold">Employment</h2>
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
        <h2 className="font-display text-base text-ink font-semibold mt-4">Emergency contact</h2>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <TextField label="Name" required value={form.emergencyContactName} onChange={(v) => setField("emergencyContactName", v)} />
          <SelectField label="Relationship" value={form.emergencyContactRelationship} onChange={(v) => setField("emergencyContactRelationship", v)} options={RELATIONSHIP_TO_HEAD_OPTIONS} />
          <TextField label="Phone" type="tel" required value={form.emergencyContactPhone} onChange={(v) => setField("emergencyContactPhone", v)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h2 className="font-display text-base text-ink font-semibold mt-4">Health</h2>
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

/* ----------------------------- Step 5 ----------------------------- */

function DocumentsReviewStep({ form, setField }) {
  const ward = WARDS.find((w) => w.id === form.wardId);
  const cda = getCdasForWard(form.wardId).find((c) => c.id === form.cdaId);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-base text-ink font-semibold">Documents</h2>
        <p className="text-sm text-muted mt-1">Optional, but they help LG Staff process the record faster.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <FileField label="Photo" accept="image/*" value={form.photo} onChange={(f) => setField("photo", f)} />
          <FileField label="ID document" accept="image/*,.pdf" value={form.idDocument} onChange={(f) => setField("idDocument", f)} />
          <FileField label="Proof of residence" accept="image/*,.pdf" value={form.proofOfResidence} onChange={(f) => setField("proofOfResidence", f)} />
        </div>
      </div>

      <div className="pt-1 border-t border-line">
        <h2 className="font-display text-base text-ink font-semibold mt-4">Review</h2>
        <div className="card bg-paper mt-3">
          <div className="card-body grid sm:grid-cols-2 gap-4 text-sm">
            <ReviewItem label="Name" value={`${form.firstName} ${form.lastName}`} />
            <ReviewItem label="Email" value={form.email} />
            <ReviewItem label="Phone" value={form.phone} />
            <ReviewItem label="Address" value={form.address} />
            <ReviewItem label="Ward" value={ward?.name} />
            <ReviewItem label="CDA" value={cda?.name} />
            <ReviewItem label="NIN" value={form.nin} />
            <ReviewItem label="Household members" value={String(form.householdMembers.length)} />
            <ReviewItem label="Domestic staff" value={form.hasDomesticStaff ? String(form.domesticStaff.length) : "None"} />
          </div>
        </div>
        <p className="text-xs text-muted mt-2">
          Submitting will create a Resident ID and email login details to <strong>{form.email || "the email above"}</strong>.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------- Confirmation ----------------------------- */

function ConfirmationScreen({ result, onContinue }) {
  return (
    <div className="card card-body text-center py-10">
      <div className="mx-auto h-12 w-12 rounded-full bg-verified-tint border border-verified/40 flex items-center justify-center text-verified mb-4">
        <Icon name="check" className="h-5 w-5" />
      </div>
      <h2 className="font-display text-xl text-ink font-semibold">Registration submitted</h2>
      <p className="text-sm text-muted mt-2 max-w-md mx-auto">
        {result.resident.first_name} now has a Resident ID. Here&rsquo;s exactly what was emailed to{" "}
        <strong>{result.resident.email}</strong> — this demo can&rsquo;t send real email, so it&rsquo;s shown here instead.
      </p>

      <div className="card bg-paper text-left mt-6 max-w-md mx-auto">
        <div className="card-header">
          <span className="text-sm font-medium text-ink">{result.message.subject}</span>
        </div>
        <div className="card-body">
          <pre className="text-sm text-text whitespace-pre-wrap font-sans">{result.message.body}</pre>
        </div>
      </div>

      <button onClick={onContinue} className="btn-primary mt-6">Go to my dashboard</button>
    </div>
  );
}

/* ----------------------------- Shared field bits ----------------------------- */

function TextField({ label, value, onChange, type = "text", required, mono, ...rest }) {
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-flagged"> *</span>}</label>
      <input
        className={`field-input ${mono ? "font-mono" : ""}`}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required, disabled, capitalize, placeholder = "Select" }) {
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: capitalize ? capitalizeWord(o) : o } : o));
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-flagged"> *</span>}</label>
      <select
        className="field-input"
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function FileField({ label, accept, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="field-input text-sm file:mr-3 file:rounded-(--radius-card) file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-on-ink hover:file:bg-ink-soft file:cursor-pointer cursor-pointer"
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {value && <span className="field-hint">{value.name}</span>}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-ink font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

function labelOptions(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }));
}

function capitalizeWord(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function fileToDataUrlIfSmall(file, maxBytes = 400_000) {
  return new Promise((resolve) => {
    if (!file || file.size > maxBytes) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}