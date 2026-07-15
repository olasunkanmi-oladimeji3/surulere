"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/useRequireRole";
import { DB, WARDS, addAuditEntry } from "@/lib/data";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import AddCdaModal from "@/components/AddCdaModal";
import PageLoading from "@/components/PageLoading";

export default function CdaMembersPage() {
  const { user, db, ready } = useRequireRole("admin");
  const [modalOpen, setModalOpen] = useState(false);

  if (!ready) return <PageLoading />;

  function removeCda(id) {
    if (!window.confirm("Remove this CDA member's access? They won't be able to log in afterwards.")) return;
    const fresh = DB.load();
    const member = fresh.users.find((u) => u.id === id);
    fresh.users = fresh.users.filter((u) => u.id !== id);
    addAuditEntry(fresh, { actorId: user.id, action: "Removed a CDA member", detail: member?.name || id });
    DB.save(fresh); // notifies the store
  }

  const cdaMembers = db.users.filter((u) => u.role === "cda");

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink font-semibold">CDA members</h1>
          <p className="text-sm text-muted mt-1">Issue and manage access for the people who verify households on the ground.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Icon name="plus" /> Add CDA member
        </button>
      </div>

      <div className="card">
        {cdaMembers.length === 0 ? (
          <EmptyState icon="shield" title="No CDA members yet" body="Add one to start getting properties verified on the ground." />
        ) : (
          <div className="divide-y divide-line">
            {cdaMembers.map((m) => {
              const w = WARDS.find((x) => x.id === m.ward_id);
              return (
                <div key={m.id} className="card-body flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-muted">{m.email} · {m.phone}</p>
                    <p className="text-xs text-muted mt-1">Assigned to {w?.name}</p>
                  </div>
                  <button onClick={() => removeCda(m.id)} className="btn-danger text-sm">
                    <Icon name="trash" className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddCdaModal open={modalOpen} onClose={() => setModalOpen(false)} addedBy={user.id} />
    </Shell>
  );
}