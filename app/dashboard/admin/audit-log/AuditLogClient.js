"use client";

import { useState } from "react";
import { ROLE_LABEL } from "@/lib/data";
import Shell from "@/components/Shell";
import Pill from "@/components/Pill";
import EmptyState from "@/components/EmptyState";

const ROLE_PILL_VARIANT = { owner: "brass", resident: "ink", cda: "restricted", admin: "ink" };

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function AuditLogClient({ user, logs }) {
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = logs.filter((l) => !roleFilter || l.actor_role === roleFilter);

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink font-semibold">Audit log</h1>
          <p className="text-sm text-muted mt-1">Who registered, added, removed, or verified what — newest first.</p>
        </div>
        <select className="field-input py-1.5 text-sm w-44" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Everyone</option>
          <option value="owner">Owners</option>
          <option value="resident">Tenants</option>
          <option value="cda">CDA members</option>
          <option value="admin">LG Staff</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon="search" title="Nothing logged yet" body="Actions like registering a property, adding a tenant, or verifying an address will show up here." />
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((log) => (
              <div key={log.id} className="card-body flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink font-medium">{log.action}</p>
                  <p className="text-sm text-muted mt-0.5">{log.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">{formatDateTime(log.created_at)}</p>
                  <div className="mt-1 flex items-center gap-1.5 justify-end">
                    <span className="text-xs text-ink">{log.actor_name}</span>
                    <Pill variant={ROLE_PILL_VARIANT[log.actor_role] || "ink"}>{ROLE_LABEL[log.actor_role] || log.actor_role}</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}