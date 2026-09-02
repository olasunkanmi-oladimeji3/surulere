"use client";
import { useState, useTransition } from "react";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import AddCdaModal from "@/components/AddCdaModal";
import { removeCdaMemberAction, updateCdaMemberWardAction } from "./actions";

export default function CdaMembersClient({ user, members, wards }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [wardErrorId, setWardErrorId] = useState(null);
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

  function reassignWard(id, wardId) {
    setWardErrorId(null);
    startTransition(async () => {
      const res = await updateCdaMemberWardAction(id, wardId);
      if (!res.ok) {
        setWardErrorId(id);
        alert(res.error);
      }
    });
  }

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink font-semibold">CDA members</h1>
          <p className="text-sm text-muted mt-1">
            Issue and manage access for the people who verify households on the ground. A CDA
            member&rsquo;s assigned ward <em>is</em> their permission scope — it&rsquo;s what
            determines which residents and properties they can see, verify, or flag.
          </p>
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div>
                    <label className="sr-only" htmlFor={`ward-${m.id}`}>Assigned ward for {m.name}</label>
                    <select
                      id={`ward-${m.id}`}
                      className={`select-field py-1.5 text-sm ${wardErrorId === m.id ? "border-flagged" : ""}`}
                      value={m.ward_id || m.ward?.id || ""}
                      onChange={(e) => reassignWard(m.id, e.target.value)}
                    >
                      {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => removeCda(m.id, m.name)} disabled={pendingId === m.id} className="btn-danger text-sm">
                    <Icon name="trash" className="h-3.5 w-3.5" /> {pendingId === m.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCdaModal open={modalOpen} onClose={() => setModalOpen(false)} wards={wards} />
    </Shell>
  );
}