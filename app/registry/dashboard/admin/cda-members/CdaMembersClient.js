// app/cda-members/CdaMembersClient.js
"use client";
import { useState, useTransition } from "react";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import AddCdaModal from "@/components/AddCdaModal";
import { removeCdaMemberAction } from "./actions";

export default function CdaMembersClient({ user, members, wards }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [, startTransition] = useTransition();

  function removeCda(id, name) {
    if (!window.confirm(`Remove ${name || "this CDA member"}'s access? They won't be able to log in afterwards.`)) return;
    setPendingId(id);
    startTransition(async () => {
      const res = await removeCdaMemberAction(id);
      setPendingId(null);
      if (!res.ok) alert(res.error);
    });
  }

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
        {members.length === 0 ? (
          <EmptyState icon="shield" title="No CDA members yet" body="Add one to start getting properties verified on the ground." />
        ) : (
          <div className="divide-y divide-line">
            {members.map((m) => (
              <div key={m.id} className="card-body flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-muted">{m.email} · {m.phone || "—"}</p>
                  <p className="text-xs text-muted mt-1">Assigned to {m.ward?.name}</p>
                </div>
                <button onClick={() => removeCda(m.id, m.name)} disabled={pendingId === m.id} className="btn-danger text-sm">
                  <Icon name="trash" className="h-3.5 w-3.5" /> {pendingId === m.id ? "Removing…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCdaModal open={modalOpen} onClose={() => setModalOpen(false)} wards={wards} />
    </Shell>
  );
}