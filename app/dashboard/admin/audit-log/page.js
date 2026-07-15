"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/useRequireRole";
import { ROLE_LABEL, formatDateTime } from "@/lib/data";
import Shell from "@/components/Shell";
import Pill from "@/components/Pill";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";

const ROLE_PILL_VARIANT = { owner: "brass", resident: "ink", cda: "restricted", admin: "ink" };

export default function AuditLogPage() {
  const { user, db, ready } = useRequireRole("admin");
  const [roleFilter, setRoleFilter] = useState("");

  if (!ready) return <PageLoading />;

  const logs = (db.auditLogs || []).filter((l) => !roleFilter || l.actorRole === roleFilter).slice().reverse();

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
        {logs.length === 0 ? (
          <EmptyState icon="search" title="Nothing logged yet" body="Actions like registering a property, adding a tenant, or verifying an address will show up here." />
        ) : (
          <div className="divide-y divide-line">
            {logs.map((log) => (
              <div key={log.id} className="card-body flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink font-medium">{log.action}</p>
                  <p className="text-sm text-muted mt-0.5">{log.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted">{formatDateTime(log.date)}</p>
                  <div className="mt-1 flex items-center gap-1.5 justify-end">
                    <span className="text-xs text-ink">{log.actorName}</span>
                    <Pill variant={ROLE_PILL_VARIANT[log.actorRole] || "ink"}>{ROLE_LABEL[log.actorRole] || log.actorRole}</Pill>
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