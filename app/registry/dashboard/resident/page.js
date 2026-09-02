"use client";

import useSWR from "swr";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import { getResidentDetail } from "@/lib/queries/residents";
import { maskNIN } from "@/lib/access";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import PageLoading from "@/components/PageLoading";

export default function ResidentProfilePage() {
  const { user, ready } = useRequireRole("resident");
  const { supabase } = useAuth();

  const { data: resident, error, isLoading } = useSWR(
    ready ? ["resident-detail", user.id] : null,
    () => getResidentDetail(supabase, user.id, "real")
  );

  if (!ready || isLoading) return <PageLoading />;
  if (error || !resident) {
    return (
      <Shell user={user}>
        <p className="field-error">Couldn&rsquo;t load your profile. Try again shortly.</p>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">My profile</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {resident.first_name}. This is what&rsquo;s on file for you.</p>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Personal</h2>
          <Stamp id={resident.resident_id} status={resident.status} />
        </div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Name" value={`${resident.first_name} ${resident.last_name}`} />
          <Field label="Gender" value={resident.gender} capitalize />
          <Field label="Date of birth" value={resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString() : null} />
          <Field label="Marital status" value={resident.marital_status} />
          <Field label="State of origin" value={resident.state_of_origin} />
          <Field label="NIN on file" value={resident.nin} mono />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Contact</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Phone" value={resident.phone} />
          <Field label="Email" value={resident.email} />
          <Field label="Ward" value={resident.property?.ward?.name} />
          <Field label="CDA" value={resident.property?.cda?.name} />
          <Field label="Address" value={resident.property?.address} />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Employment</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Occupation" value={resident.occupation} />
          <Field label="Employment status" value={resident.employment_status} />
          <Field label="Employer" value={resident.employer_name} />
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Emergency contact</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-5">
          <Field label="Name" value={resident.emergency_contact_name} />
          <Field label="Relationship" value={resident.emergency_contact_relationship} />
          <Field label="Phone" value={resident.emergency_contact_phone} />
        </div>
      </div>

      <div className="card card-body bg-paper">
        <p className="text-sm font-medium text-ink">Who can see this record</p>
        <ul className="text-sm text-muted mt-2 space-y-1 list-disc list-inside">
          <li>Your landlord and LG Staff can see your full record, including your NIN.</li>
          <li>Your CDA can confirm your household exists, but your NIN is hidden from them ({resident.nin ? maskNIN(resident.nin) : "—"}).</li>
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
