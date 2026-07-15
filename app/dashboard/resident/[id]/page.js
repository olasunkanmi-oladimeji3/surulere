"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireRole } from "@/lib/useRequireRole";
import {
  WARDS, getCda, maskNIN, formatDate, navHrefFor, statusLabel,
  BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS, OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS, STAFF_ROLE_LABELS,
} from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import PageLoading from "@/components/PageLoading";
import LogVisitModal from "@/components/LogVisitModal";

export default function ResidentProfilePage() {
  const { user, db, ready } = useRequireRole(null); // any logged-in role; access checked per-resident below
  const params = useParams();
  const residentId = params.id;
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  if (!ready) return <PageLoading />;

  const resident = db.residents.find((r) => r.id === residentId);

  const navProps = {
    resident: { navLabel: "My household", navIcon: "doorOpen" },
    cda: { navLabel: "My ward", navIcon: "shield" },
    admin: { navLabel: "Overview", navIcon: "building" },
  }[user.role];

  if (!resident) {
    return (
      <Shell user={user} {...navProps}>
        <BackLink href={navHrefFor(user.role)} />
        <p className="text-sm text-muted mt-4">No resident found with that ID.</p>
      </Shell>
    );
  }

  const isSelf = user.role === "resident" && user.id === resident.id;
  const isAdmin = user.role === "admin";
  const isAssignedCda = user.role === "cda" && user.ward_id === resident.ward_id;
  const hasAccess = isSelf || isAdmin || isAssignedCda;

  if (!hasAccess) {
    return (
      <Shell user={user} {...navProps}>
        <BackLink href={navHrefFor(user.role)} />
        <div className="card card-body mt-4">
          <p className="font-medium text-ink">Access restricted</p>
          <p className="text-sm text-muted mt-1">
            This resident isn&rsquo;t one you&rsquo;re assigned to view. If you think that&rsquo;s wrong, check with LG Staff.
          </p>
        </div>
      </Shell>
    );
  }

  const canSeeFullNin = isSelf || isAdmin;
  const canLogVisit = isAssignedCda || isAdmin;
  const household = db.households.find((h) => h.id === resident.household_id);
  const ward = WARDS.find((w) => w.id === resident.ward_id);
  const cda = getCda(resident.cda_id);

  return (
    <Shell user={user} {...navProps}>
      <BackLink href={navHrefFor(user.role)} />

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Stamp id={resident.resident_id} status={resident.status} />
            {household && <span className="text-xs text-muted">Household {household.household_number}</span>}
          </div>
          <h1 className="font-display text-2xl text-ink font-semibold mt-2">{resident.first_name} {resident.last_name}</h1>
          <p className="text-sm text-muted">{resident.address}</p>
        </div>
        {canLogVisit && (
          <button onClick={() => setVisitModalOpen(true)} className="btn-brass">
            <Icon name="flag" /> {user.role === "cda" ? "Log a visit" : "Update verification"}
          </button>
        )}
      </div>

      {household?.status === "flagged" && household.flagNote && (
        <div className="card card-body border-flagged/40 bg-flagged-tint mb-6 flex items-start gap-3">
          <Icon name="flag" className="h-4 w-4 text-flagged mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-flagged">Flagged for review</p>
            <p className="text-sm text-flagged/90 mt-0.5">{household.flagNote}</p>
          </div>
        </div>
      )}

      <Section title="Personal">
        <Field label="Resident ID" value={resident.resident_id} mono />
        <Field label="Gender" value={resident.gender} capitalize />
        <Field label="Date of birth" value={formatDate(resident.date_of_birth)} />
        <Field label="Marital status" value={resident.marital_status} />
        <Field label="State of origin" value={resident.state_of_origin} />
        <Field label="NIN" value={canSeeFullNin ? resident.nin : maskNIN(resident.nin)} mono />
      </Section>

      <Section title="Contact">
        <Field label="Phone" value={resident.phone} />
        <Field label="Alternative phone" value={resident.alternative_phone} />
        <Field label="Email" value={resident.email} />
        <Field label="Landmark" value={resident.landmark} />
        <Field label="Ward" value={ward?.name} />
        <Field label="CDA" value={cda?.name} />
      </Section>

      {household && (
        <Section title="Household & property">
          <Field label="Household number" value={household.household_number} mono />
          <Field label="Building type" value={BUILDING_TYPE_LABELS[household.building_type]} />
          <Field label="Property type" value={PROPERTY_TYPE_LABELS[household.property_type]} />
          <Field label="Occupancy type" value={OCCUPANCY_TYPE_LABELS[household.occupancy_type]} />
          {household.tenancy_type && <Field label="Tenancy type" value={TENANCY_TYPE_LABELS[household.tenancy_type]} />}
          <Field label="Registered" value={formatDate(household.created_at)} />
        </Section>
      )}

      {household?.members?.length > 0 && (
        <Section title={`Other household members — ${household.members.length}`}>
          <div className="sm:col-span-3">
            <ul className="divide-y divide-line">
              {household.members.map((m) => (
                <li key={m.id} className="py-2.5 text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ink font-medium">{m.first_name} {m.last_name}</span>
                  <span className="text-muted">{m.relationship_to_head || "—"} · {m.gender || "—"} · {m.age ? `${m.age} yrs` : "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {household?.staff?.length > 0 && (
        <Section title={`Domestic staff — ${household.staff.length}`}>
          <div className="sm:col-span-3">
            <ul className="divide-y divide-line">
              {household.staff.map((s) => (
                <li key={s.id} className="py-2.5 text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ink font-medium">{s.first_name} {s.surname}</span>
                  <span className="text-muted">{STAFF_ROLE_LABELS[s.role_type] || s.role_type} · {s.phone || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section title="Employment">
        <Field label="Occupation" value={resident.occupation} />
        <Field label="Employment status" value={resident.employment_status} />
        <Field label="Employer" value={resident.employer_name} />
      </Section>

      <Section title="Emergency contact">
        <Field label="Name" value={resident.emergency_contact_name} />
        <Field label="Relationship" value={resident.emergency_contact_relationship} />
        <Field label="Phone" value={resident.emergency_contact_phone} />
      </Section>

      {(resident.disability || resident.chronic_illness) && (
        <Section title="Health">
          {resident.disability && <Field label="Disability" value={resident.disability_type || "Yes"} />}
          {resident.chronic_illness && <Field label="Chronic illness" value={resident.chronic_illness_type || "Yes"} />}
        </Section>
      )}

      {household && (
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="font-display text-base text-ink font-semibold">Verification history</h2>
          </div>
          <div className="card-body">
            {db.verificationLogs.filter((l) => l.household_id === household.id).length === 0 ? (
              <p className="text-sm text-muted">No visits logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {db.verificationLogs
                  .filter((l) => l.household_id === household.id)
                  .slice().reverse()
                  .map((log) => {
                    const actor = db.users.find((u) => u.id === log.cdaId);
                    return (
                      <li key={log.id} className="text-sm">
                        <div className="flex items-center gap-2">
                          <Stamp id={statusLabel(log.outcome)} status={log.outcome} hideDot />
                          <span className="text-muted text-xs">{formatDate(log.date)} · {actor?.name || "Unknown"}</span>
                        </div>
                        <p className="text-text mt-1">{log.note}</p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      )}

      {household && (
        <LogVisitModal
          open={visitModalOpen}
          onClose={() => setVisitModalOpen(false)}
          householdId={household.id}
          cdaId={user.id}
          actionLabel={user.role === "cda" ? "Submit" : "Update"}
        />
      )}
    </Shell>
  );
}

function BackLink({ href }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
      <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
    </Link>
  );
}

function Section({ title, children }) {
  return (
    <div className="card mb-6">
      <div className="card-header">
        <h2 className="font-display text-base text-ink font-semibold">{title}</h2>
      </div>
      <div className="card-body grid sm:grid-cols-3 gap-5">{children}</div>
    </div>
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