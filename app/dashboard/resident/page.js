"use client";

import { useRequireRole } from "@/lib/useRequireRole";
import { WARDS, getCda, formatDate, maskNIN } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import PageLoading from "@/components/PageLoading";

export default function ResidentProfilePage() {
  const { user, db, ready } = useRequireRole("resident");

  if (!ready) return <PageLoading />;

  const property = db.properties.find((p) => p.id === user.property_id);
  const ward = property ? WARDS.find((w) => w.id === property.ward_id) : null;
  const cda = property ? getCda(property.cda_id) : null;

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">My profile</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {user.first_name}. This is what&rsquo;s on file for you.</p>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Personal</h2>
          <Stamp id={user.resident_id} status={user.status} />
        </div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Name" value={`${user.first_name} ${user.last_name}`} />
          <Field label="Gender" value={user.gender} capitalize />
          <Field label="Date of birth" value={formatDate(user.date_of_birth)} />
          <Field label="Marital status" value={user.marital_status} />
          <Field label="State of origin" value={user.state_of_origin} />
          <Field label="NIN on file" value={user.nin} mono />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Contact</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Phone" value={user.phone} />
          <Field label="Email" value={user.email} />
          <Field label="Ward" value={ward?.name} />
          <Field label="CDA" value={cda?.name} />
          <Field label="Address" value={property?.address} />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Employment</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Occupation" value={user.occupation} />
          <Field label="Employment status" value={user.employment_status} />
          <Field label="Employer" value={user.employer_name} />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Emergency contact</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Name" value={user.emergency_contact_name} />
          <Field label="Relationship" value={user.emergency_contact_relationship} />
          <Field label="Phone" value={user.emergency_contact_phone} />
        </div>
      </div>

      <div className="card card-body bg-paper">
        <p className="text-sm font-medium text-ink">Who can see this record</p>
        <ul className="text-sm text-muted mt-2 space-y-1 list-disc list-inside">
          <li>Your landlord and LG Staff can see your full record, including your NIN.</li>
          <li>Your CDA can confirm your household exists, but your NIN is hidden from them ({maskNIN(user.nin)}).</li>
          <li>No one else has access.</li>
        </ul>
      </div>
    </Shell>
  );
}

function Field({ label, value, mono = false, capitalize = false }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium text-ink mt-0.5 ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>{value || "—"}</p>
    </div>
  );
}
