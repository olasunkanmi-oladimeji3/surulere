"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireRole } from "@/lib/useRequireRole";
import {
  WARDS, getCda, formatDate, navHrefFor, statusLabel,
  BUILDING_TYPE_LABELS, PROPERTY_TYPE_LABELS, OCCUPANCY_TYPE_LABELS, TENANCY_TYPE_LABELS, STAFF_ROLE_LABELS,
  removeTenantFromUnit,
} from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import PageLoading from "@/components/PageLoading";
import LogVisitModal from "@/components/LogVisitModal";
import TenantForm from "@/components/forms/TenantForm";

export default function PropertyProfilePage() {
  const { user, db, ready } = useRequireRole(null); // any logged-in role; access checked per-property below
  const params = useParams();
  const propertyId = params.id;
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [addingUnit, setAddingUnit] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  if (!ready) return <PageLoading />;

  const property = db.properties.find((p) => p.id === propertyId);

  if (!property) {
    return (
      <Shell user={user}>
        <BackLink href={navHrefFor(user.role)} />
        <p className="text-sm text-muted mt-4">No property found with that ID.</p>
      </Shell>
    );
  }

  const isOwnerOfThis = user.role === "owner" && property.owner_id === user.id;
  const isAdmin = user.role === "admin";
  const isAssignedCda = user.role === "cda" && user.ward_id === property.ward_id;
  const isTenantHere = user.role === "resident" && property.units.some((u) => u.tenant_id === user.id);
  const hasAccess = isOwnerOfThis || isAdmin || isAssignedCda || isTenantHere;

  if (!hasAccess) {
    return (
      <Shell user={user}>
        <BackLink href={navHrefFor(user.role)} />
        <div className="card card-body mt-4">
          <p className="font-medium text-ink">Access restricted</p>
          <p className="text-sm text-muted mt-1">
            This property isn&rsquo;t one you&rsquo;re assigned to view. If you think that&rsquo;s wrong, check with LG Staff.
          </p>
        </div>
      </Shell>
    );
  }

  const canManageTenants = isOwnerOfThis || isAdmin;
  const canLogVisit = isAssignedCda || isAdmin;
  const owner = db.owners.find((o) => o.id === property.owner_id);
  const ward = WARDS.find((w) => w.id === property.ward_id);
  const cda = getCda(property.cda_id);

  function removeTenant(unitId) {
    if (!window.confirm("Remove this tenant from the unit? This deletes their record entirely.")) return;
    removeTenantFromUnit(propertyId, unitId); // notifies the store
  }

  if (addingUnit) {
    return (
      <Shell user={user}>
        <BackLink href={navHrefFor(user.role)} label="Back to property" onClick={() => setAddingUnit(null)} />
        <div className="card card-body mt-4 max-w-3xl">
          <TenantForm
            propertyId={propertyId}
            unitId={addingUnit.id}
            unitLabel={addingUnit.unit_number}
            actorId={user.id}
            onCancel={() => setAddingUnit(null)}
            onDone={(tenant, message) => { setAddingUnit(null); setConfirmation({ tenant, message }); }}
          />
        </div>
      </Shell>
    );
  }

  if (confirmation) {
    return (
      <Shell user={user}>
        <div className="card card-body text-center py-10 max-w-md mx-auto">
          <div className="mx-auto h-12 w-12 rounded-full bg-verified-tint border border-verified/40 flex items-center justify-center text-verified mb-4">
            <Icon name="check" className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl text-ink font-semibold">Tenant added</h2>
          <p className="text-sm text-muted mt-2">
            {confirmation.tenant.first_name} now has a Resident ID. Here&rsquo;s exactly what was emailed to{" "}
            <strong>{confirmation.tenant.email}</strong> — this demo can&rsquo;t send real email, so it&rsquo;s shown here instead.
          </p>
          <div className="card bg-paper text-left mt-6">
            <div className="card-header"><span className="text-sm font-medium text-ink">{confirmation.message.subject}</span></div>
            <div className="card-body"><pre className="text-sm text-text whitespace-pre-wrap font-sans">{confirmation.message.body}</pre></div>
          </div>
          <button onClick={() => setConfirmation(null)} className="btn-primary mt-6">Back to property</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <BackLink href={navHrefFor(user.role)} />

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Stamp id={property.property_number} status={property.status} />
            <span className="text-xs text-muted">Added {formatDate(property.created_at)}</span>
          </div>
          <h1 className="font-display text-2xl text-ink font-semibold mt-2">{property.address}</h1>
          <p className="text-sm text-muted">{ward?.name} · {cda?.name}</p>
        </div>
        {canLogVisit && (
          <button onClick={() => setVisitModalOpen(true)} className="btn-brass">
            <Icon name="flag" /> {user.role === "cda" ? "Log a visit" : "Update verification"}
          </button>
        )}
      </div>

      {property.status === "flagged" && property.flagNote && (
        <div className="card card-body border-flagged/40 bg-flagged-tint mb-6 flex items-start gap-3">
          <Icon name="flag" className="h-4 w-4 text-flagged mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-flagged">Flagged for review</p>
            <p className="text-sm text-flagged/90 mt-0.5">{property.flagNote}</p>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Property</h2>
        </div>
        <div className="card-body grid sm:grid-cols-3 gap-4">
          <Field label="Owner" value={owner?.name} />
          <Field label="Owner phone" value={owner?.phone} />
          <Field label="Building type" value={BUILDING_TYPE_LABELS[property.building_type]} />
          <Field label="Property type" value={PROPERTY_TYPE_LABELS[property.property_type]} />
        </div>
      </div>

      {property.staff?.length > 0 && (
        <div className="card mb-6">
          <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Domestic staff — {property.staff.length}</h2></div>
          <div className="card-body">
            <ul className="divide-y divide-line">
              {property.staff.map((s) => (
                <li key={s.id} className="py-2.5 text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ink font-medium">{s.first_name} {s.surname}</span>
                  <span className="text-muted">{STAFF_ROLE_LABELS[s.role_type] || s.role_type} · {s.phone || "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Units — {property.units.length}</h2>
          <span className="text-xs text-muted">{property.units.filter((u) => u.occupancy === "occupied").length} occupied</span>
        </div>
        <div className="divide-y divide-line">
          {property.units.map((unit) => {
            const tenant = db.residents.find((r) => r.id === unit.tenant_id);
            return (
              <div key={unit.id} className="card-body flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Stamp id={unit.unit_number} hideDot />
                    <span className={`pill-${unit.occupancy === "occupied" ? "ink" : "brass"}`}>
                      {unit.occupancy === "occupied" ? "Occupied" : "Vacant"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1.5">
                    {OCCUPANCY_TYPE_LABELS[unit.occupancy_type] || "—"}
                    {unit.tenancy_type ? ` · ${TENANCY_TYPE_LABELS[unit.tenancy_type]}` : ""}
                  </p>
                  {tenant && (
                    <div className="mt-2 text-sm">
                      <Link href={`/registry/resident/${tenant.id}`} className="text-ink font-medium hover:text-brass hover:underline">
                        {tenant.first_name} {tenant.last_name}
                      </Link>
                      <p className="text-muted">{tenant.phone} · {tenant.resident_id}</p>
                    </div>
                  )}
                </div>
                {canManageTenants && (
                  <div className="shrink-0">
                    {unit.occupancy === "occupied" ? (
                      <button onClick={() => removeTenant(unit.id)} className="btn-danger text-sm">
                        <Icon name="trash" className="h-3.5 w-3.5" /> Remove tenant
                      </button>
                    ) : (
                      <button onClick={() => setAddingUnit(unit)} className="btn-secondary text-sm">
                        <Icon name="plus" className="h-3.5 w-3.5" /> Add tenant
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Verification history</h2></div>
        <div className="card-body">
          {db.verificationLogs.filter((l) => l.property_id === propertyId).length === 0 ? (
            <p className="text-sm text-muted">No visits logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {db.verificationLogs.filter((l) => l.property_id === propertyId).slice().reverse().map((log) => {
                const actor = db.users.find((u) => u.id === log.actorId);
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

      <LogVisitModal
        open={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        propertyId={propertyId}
        actorId={user.id}
        actionLabel={user.role === "cda" ? "Submit" : "Update"}
      />
    </Shell>
  );
}

function BackLink({ href, label = "Back", onClick }) {
  if (onClick) {
    return (
      <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <Icon name="arrowLeft" className="h-3.5 w-3.5" /> {label}
      </button>
    );
  }
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
      <Icon name="arrowLeft" className="h-3.5 w-3.5" /> {label}
    </Link>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-ink mt-0.5">{value || "—"}</p>
    </div>
  );
}
