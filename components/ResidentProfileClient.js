"use client";
import Link from "next/link";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import { maskNIN } from "@/lib/access";
import {
  statusLabel, BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS,
  OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS,
} from "@/lib/data";

/**
 * `access` (from lib/queries/residents.js's computeResidentAccess) gates the
 * NIN: full for admin/self/the record's own owner, masked for everyone else
 * (e.g. an assigned CDA member) — same policy lib/access.js documents.
 */
export default function ResidentProfileClient({ user, resident, access, backHref = "/registry/dashboard/admin/residents" }) {
  const isField = resident.type === "field";
  const canSeeFullNin = access?.isAdmin || access?.isSelf || access?.isOwnerOfThis;

  return (
    <Shell user={user}>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Stamp id={isField ? resident.resident_ref : resident.resident_id} status={resident.status} />
            {isField && <span className="pill-brass text-xs">Field-collected</span>}
          </div>
          <h1 className="font-display text-2xl text-ink font-semibold mt-2">{resident.first_name} {resident.last_name}</h1>
          <p className="text-sm text-muted">{resident.property?.address}</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Personal details</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-4">
          <Field label="Phone" value={resident.phone} />
          {resident.email && <Field label="Email" value={resident.email} />}
          <Field label="Gender" value={resident.gender} capitalize />
          <Field label="Date of birth" value={resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString() : null} />
          <Field label="Marital status" value={resident.marital_status} />
          <Field label="State of origin" value={resident.state_of_origin} />
          <Field label="Occupation" value={resident.occupation} />
          {resident.nin && <Field label="NIN" value={canSeeFullNin ? resident.nin : maskNIN(resident.nin)} mono />}
          {!isField && resident.disability && <Field label="Disability" value={resident.disability_type || "Yes"} />}
          {!isField && resident.chronic_illness && <Field label="Chronic illness" value={resident.chronic_illness_type || "Yes"} />}
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">House</h2></div>
        <div className="card-body grid sm:grid-cols-3 gap-4">
          <Field label="Property" value={resident.property?.property_number} mono />
          <Field label="Address" value={resident.property?.address} />
          <Field label="Ward" value={resident.property?.ward?.name} />
          <Field label="CDA" value={resident.property?.cda?.name} />
          <Field label="Building type" value={BUILDING_TYPE_LABELS[resident.property?.building_type]} />
          <Field label="Property type" value={PROPERTY_TYPE_LABELS[resident.property?.property_type]} />
          <Field label="Owner" value={resident.property?.owner ? `${resident.property.owner.full_name || `${resident.property.owner.first_name} ${resident.property.owner.last_name}`}` : null} />
          {resident.unit && (
            <>
              <Field label="Unit" value={resident.unit.unit_number} mono />
              <Field label="Unit type" value={OCCUPANCY_TYPE_LABELS[resident.unit.occupancy_type]} />
              {resident.unit.tenancy_type && <Field label="Tenancy" value={TENANCY_TYPE_LABELS[resident.unit.tenancy_type]} />}
            </>
          )}
          {isField && resident.unit_description && <Field label="Unit / flat" value={resident.unit_description} />}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Household — {resident.householdMembers.length}</h2>
          {resident.is_head && <span className="pill-brass text-xs">Head of household</span>}
        </div>
        {resident.householdMembers.length === 0 ? (
          <div className="card-body"><p className="text-sm text-muted">No other household members recorded.</p></div>
        ) : (
          <div className="divide-y divide-line">
            {resident.householdMembers.map((m) => (
              <div key={m.id || `${m.first_name}-${m.last_name}`} className="card-body flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {m.relationship_to_head || m.relationship} · {m.age ? `${m.age} yrs` : "—"} {m.gender ? `· ${m.gender}` : ""}
                  </p>
                </div>
                {m.phone && <span className="text-xs text-muted">{m.phone}</span>}
              </div>
            ))}
          </div>
        )}
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