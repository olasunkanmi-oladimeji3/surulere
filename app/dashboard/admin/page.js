"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/lib/useRequireRole";
import { WARDS, CDAS, getCdasForWard, searchResidents, statusLabel, GENDER_OPTIONS } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";

export default function AdminDashboard() {
  const { user, db, ready } = useRequireRole("admin");
  const [query, setQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const [cdaId, setCdaId] = useState("");
  const [gender, setGender] = useState("");

  if (!ready) return <PageLoading />;

  const verified = db.properties.filter((p) => p.status === "verified").length;
  const pending = db.properties.filter((p) => p.status === "pending").length;
  const flagged = db.properties.filter((p) => p.status === "flagged");
  const cdaOptionsForFilter = wardId ? getCdasForWard(wardId) : CDAS;

  const results = searchResidents(db, { query, wardId, cdaId, gender });

  const totalOwners = db.owners.length;
  const totalTenants = db.residents.length;
  const totalCda = db.users.filter((u) => u.role === "cda").length;
  const totalAdmin = db.users.filter((u) => u.role === "admin").length;

  const wardCounts = WARDS.map((w) => ({
    ward: w,
    count: db.properties.filter((p) => p.ward_id === w.id).length,
  })).sort((a, b) => b.count - a.count);
  const maxWardCount = Math.max(1, ...wardCounts.map((w) => w.count));

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">LGA overview</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {user.name}. Here&rsquo;s the full registry.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <StatCard label="Properties" value={db.properties.length} />
        <StatCard label="Verified" value={verified} tone="text-verified" />
        <StatCard label="Pending" value={pending} tone="text-pending" />
        <StatCard label="Flagged" value={flagged.length} tone="text-flagged" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-7">
        <div className="card">
          <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Community at a glance</h2></div>
          <div className="card-body grid grid-cols-2 gap-4">
            <StatCard label="Owners" value={totalOwners} />
            <StatCard label="Tenants" value={totalTenants} />
            <StatCard label="CDA members" value={totalCda} />
            <StatCard label="LG Staff" value={totalAdmin} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Properties by ward</h2></div>
          <div className="card-body space-y-2.5">
            {wardCounts.map(({ ward, count }) => (
              <div key={ward.id} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16 shrink-0">{ward.code}</span>
                <div className="flex-1 h-2 rounded-full bg-paper overflow-hidden">
                  <div className="h-full bg-brass rounded-full" style={{ width: `${(count / maxWardCount) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-ink w-6 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {flagged.length > 0 && (
        <div className="card mb-7">
          <div className="card-header">
            <h2 className="font-display text-base text-ink font-semibold">Needs attention</h2>
            <span className="text-xs text-muted">{flagged.length} flagged</span>
          </div>
          <div className="divide-y divide-line">
            {flagged.map((p) => {
              const owner = db.owners.find((o) => o.id === p.owner_id);
              return (
                <div key={p.id} className="card-body flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5"><Stamp id={p.property_number} status="flagged" /></div>
                    <p className="text-sm text-ink mt-1.5">{p.address} · {owner?.name}</p>
                    <p className="text-xs text-muted mt-0.5">{p.flagNote}</p>
                  </div>
                  <Link href={`/property/${p.id}`} className="btn-secondary text-sm shrink-0">Review</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h2 className="font-display text-base text-ink font-semibold">All residents</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon name="search" className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="field-input pl-8 py-1.5 text-sm w-48"
                placeholder="Name, resident or property ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className="field-input py-1.5 text-sm" value={wardId} onChange={(e) => { setWardId(e.target.value); setCdaId(""); }}>
              <option value="">All wards</option>
              {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="field-input py-1.5 text-sm" value={cdaId} onChange={(e) => setCdaId(e.target.value)}>
              <option value="">All CDAs</option>
              {cdaOptionsForFilter.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="field-input py-1.5 text-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">All genders</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g} className="capitalize">{g}</option>)}
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyState icon="search" title="No residents match" body="Try a different search term or clear the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr><th>Resident</th><th>Property</th><th>Ward</th><th>Gender</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const property = db.properties.find((p) => p.id === r.property_id);
                  const w = WARDS.find((x) => x.id === property?.ward_id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <p className="font-mono text-xs text-ink">{r.resident_id}</p>
                        <p className="text-ink">{r.first_name} {r.last_name}</p>
                      </td>
                      <td className="text-muted">
                        <p className="font-mono text-xs">{property?.property_number || "—"}</p>
                        <p>{property?.address}</p>
                      </td>
                      <td className="text-muted">{w?.name}</td>
                      <td className="text-muted capitalize">{r.gender || "—"}</td>
                      <td><Stamp id={statusLabel(r.status)} status={r.status} hideDot /></td>
                      <td><Link href={`/resident/${r.id}`} className="text-brass font-medium hover:underline">View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}

function StatCard({ label, value, tone = "text-ink" }) {
  return (
    <div className="card card-body py-4">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`font-display text-2xl font-semibold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}