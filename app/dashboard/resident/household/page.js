"use client";

import { useRequireRole } from "@/lib/useRequireRole";
import {
  BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS, OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS, STAFF_ROLE_LABELS,
} from "@/lib/data";
import Shell from "@/components/Shell";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";

export default function ResidentHouseholdPage() {
  const { user, db, ready } = useRequireRole("resident");

  if (!ready) return <PageLoading />;

  const property = db.properties.find((p) => p.id === user.property_id);
  const unit = property?.units.find((u) => u.id === user.unit_id);
  const owner = property ? db.owners.find((o) => o.id === property.owner_id) : null;

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">My household</h1>
        <p className="text-sm text-muted mt-1">Your unit, your landlord, and who else is on file with you.</p>
      </div>

      {!property || !unit ? (
        <div className="card"><EmptyState icon="doorOpen" title="No unit on file" body="Something's off — check with your landlord or LG Staff." /></div>
      ) : (
        <>
          <div className="card mb-6">
            <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Your unit</h2></div>
            <div className="card-body grid sm:grid-cols-3 gap-5">
              <Field label="Unit number" value={unit.unit_number} mono />
              <Field label="Building type" value={BUILDING_TYPE_LABELS[property.building_type]} />
              <Field label="Property type" value={PROPERTY_TYPE_LABELS[property.property_type]} />
              <Field label="Occupancy type" value={OCCUPANCY_TYPE_LABELS[unit.occupancy_type]} />
              {unit.tenancy_type && <Field label="Tenancy type" value={TENANCY_TYPE_LABELS[unit.tenancy_type]} />}
            </div>
          </div>

          <div className="card mb-6">
            <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Landlord</h2></div>
            <div className="card-body grid sm:grid-cols-3 gap-5">
              <Field label="Name" value={owner?.name} />
              <Field label="Phone" value={owner?.phone} />
              <Field label="Email" value={owner?.email} />
            </div>
          </div>

          <div className="card mb-6">
            <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Other household members</h2></div>
            <div className="card-body">
              {user.household_members?.length > 0 ? (
                <ul className="divide-y divide-line">
                  {user.household_members.map((m) => (
                    <li key={m.id} className="py-2.5 text-sm flex flex-wrap items-center justify-between gap-2">
                      <span className="text-ink font-medium">{m.first_name} {m.last_name}</span>
                      <span className="text-muted">{m.relationship_to_head || "—"} · {m.age ? `${m.age} yrs` : "—"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No other members on file.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Domestic staff at this property</h2></div>
            <div className="card-body">
              {property.staff?.length > 0 ? (
                <ul className="divide-y divide-line">
                  {property.staff.map((s) => (
                    <li key={s.id} className="py-2.5 text-sm flex flex-wrap items-center justify-between gap-2">
                      <span className="text-ink font-medium">{s.first_name} {s.surname}</span>
                      <span className="text-muted">{STAFF_ROLE_LABELS[s.role_type] || s.role_type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">None on file.</p>
              )}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium text-ink mt-0.5 ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}
