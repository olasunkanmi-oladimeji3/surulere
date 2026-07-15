// app/property/[id]/PropertyProfileClient.js
"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import LogVisitModal from "@/components/LogVisitModal";
import TenantForm from "@/components/forms/TenantForm";
import {
  BUILDING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  OCCUPANCY_TYPE_LABELS,
  TENANCY_TYPE_LABELS,
  STAFF_ROLE_LABELS,
  navHrefFor,
} from "@/lib/data";
import { removeTenantAction } from "./actions";

export default function PropertyProfileClient({
  user,
  property,
  access,
  logs,
}) {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [addingUnit, setAddingUnit] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [pending, startTransition] = useTransition();

  function removeTenant(unitId) {
    if (
      !window.confirm(
        "Remove this tenant from the unit? This deletes their record entirely.",
      )
    )
      return;
    startTransition(async () => {
      const res = await removeTenantAction(property.id, unitId);
      if (!res.ok) alert(res.error);
      // revalidatePath refreshes server data; no local state mutation needed
    });
  }

  if (addingUnit) {
    return (
      <Shell user={user}>
        <button
          onClick={() => setAddingUnit(null)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back to property
        </button>
        <div className="card card-body mt-4 max-w-3xl">
          <TenantForm
            propertyId={property.id}
            unitId={addingUnit.id}
            unitLabel={addingUnit.unit_number}
            actorId={user.id}
            onCancel={() => setAddingUnit(null)}
            onDone={(tenant, message) => {
              setAddingUnit(null);
              setConfirmation({ tenant, message });
            }}
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
          <h2 className="font-display text-xl text-ink font-semibold">
            Tenant added
          </h2>
          <p className="text-sm text-muted mt-2">
            {confirmation.tenant.first_name} now has a Resident ID. Here&rsquo;s
            exactly what was emailed to{" "}
            <strong>{confirmation.tenant.email}</strong> — this demo can&rsquo;t
            send real email, so it&rsquo;s shown here instead.
          </p>
          <div className="card bg-paper text-left mt-6">
            <div className="card-header">
              <span className="text-sm font-medium text-ink">
                {confirmation.message.subject}
              </span>
            </div>
            <div className="card-body">
              <pre className="text-sm text-text whitespace-pre-wrap font-sans">
                {confirmation.message.body}
              </pre>
            </div>
          </div>
          <button
            onClick={() => setConfirmation(null)}
            className="btn-primary mt-6"
          >
            Back to property
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <Link
        href={navHrefFor(user.role)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Stamp id={property.property_number} status={property.status} />
            <span className="text-xs text-muted">
              Added {new Date(property.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="font-display text-2xl text-ink font-semibold mt-2">
            {property.address}
          </h1>
          <p className="text-sm text-muted">
            {property.ward?.name} · {property.cda?.name}
          </p>
        </div>
        {access.canLogVisit && (
          <button onClick={() => setVisitModalOpen(true)} className="btn-brass">
            <Icon name="flag" />{" "}
            {user.role === "cda" ? "Log a visit" : "Update verification"}
          </button>
        )}
      </div>

      {property.status === "flagged" && property.flag_note && (
        <div className="card card-body border-flagged/40 bg-flagged-tint mb-6 flex items-start gap-3">
          <Icon name="flag" className="h-4 w-4 text-flagged mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-flagged">
              Flagged for review
            </p>
            <p className="text-sm text-flagged/90 mt-0.5">
              {property.flag_note}
            </p>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">
            Property
          </h2>
        </div>
        <div className="card-body grid sm:grid-cols-3 gap-4">
          <Field label="Owner" value={property.owner?.full_name} />
          <Field label="Owner phone" value={property.owner?.phone} />
          <Field
            label="Building type"
            value={BUILDING_TYPE_LABELS[property.building_type]}
          />
          <Field
            label="Property type"
            value={PROPERTY_TYPE_LABELS[property.property_type]}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">
            Units — {property.units.length}
          </h2>
          <span className="text-xs text-muted">
            {property.units.filter((u) => u.occupancy === "occupied").length}{" "}
            occupied
          </span>
        </div>
        <div className="divide-y divide-line">
          {property.units.length === 0 &&
            property.fieldResidents.length > 0 && (
              <div className="card mt-6">
                <div className="card-header">
                  <h2 className="font-display text-base text-ink font-semibold">
                    Residents (collected in field) —{" "}
                    {property.fieldResidents.length}
                  </h2>
                  <span className="text-xs text-muted">
                    Not yet linked to a login account
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {property.fieldResidents.map((r) => (
                    // inside the fieldResidents .map() in PropertyProfileClient.js
                    <div
                      key={r.id}
                      className="card-body flex items-center justify-between gap-4"
                    >
                      <div>
                        <Link
                          href={`/resident/${r.id}?type=field`}
                          className="text-sm font-medium text-ink hover:text-brass hover:underline"
                        >
                          {r.first_name} {r.last_name}
                        </Link>
                        {r.is_head && (
                          <span className="pill-brass text-xs ml-1">
                            Head of household
                          </span>
                        )}
                        <p className="text-xs text-muted mt-0.5">
                          {r.phone} · {r.resident_ref}
                        </p>
                      </div>
                      <Stamp id={r.status} status={r.status} hideDot />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">
            Verification history
          </h2>
        </div>
        <div className="card-body">
          {logs.length === 0 ? (
            <p className="text-sm text-muted">No visits logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Stamp id={log.outcome} status={log.outcome} hideDot />
                    <span className="text-muted text-xs">
                      {new Date(log.created_at).toLocaleDateString()} ·{" "}
                      {log.profiles?.full_name || "Unknown"}
                    </span>
                  </div>
                  <p className="text-text mt-1">{log.note}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <LogVisitModal
        open={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        propertyId={property.id}
        actorId={user.id}
        actionLabel={user.role === "cda" ? "Submit" : "Update"}
      />
    </Shell>
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
