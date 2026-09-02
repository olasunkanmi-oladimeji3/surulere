// app/dashboard/admin/AdminDashboardClient.js
"use client";

import { useState } from "react";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import EmptyState from "@/components/EmptyState";
import FilterBar, { SearchField, FilterFields } from "@/components/FilterBar";
import { statusLabel, GENDER_OPTIONS } from "@/lib/data";

// Property/resident detail views live in the registry app, not here.
const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL || "http://localhost:3000/registry";

export default function AdminDashboardClient({ user, properties, wards, cdas, residents, counts }) {
  const [query, setQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const [cdaId, setCdaId] = useState("");
  const [gender, setGender] = useState("");

  const flagged = properties.filter((p) => p.status === "flagged");
  const cdaOptionsForFilter = wardId ? cdas.filter((c) => c.ward_id === wardId) : cdas;

  const results = residents.filter((r) => {
    const property = r.properties;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = [r.first_name, r.last_name, r.resident_id, property?.property_number, property?.address]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (wardId && property?.ward_id !== wardId) return false;
    if (cdaId && property?.cda_id !== cdaId) return false;
    if (gender && r.gender !== gender) return false;
    return true;
  });

  const wardCounts = wards
    .map((w) => ({ ward: w, count: properties.filter((p) => p.ward_id === w.id).length }))
    .sort((a, b) => b.count - a.count);
  const maxWardCount = Math.max(1, ...wardCounts.map((w) => w.count));

  const activeFilterCount = [query.trim(), wardId, cdaId, gender].filter(Boolean).length;
  function clearFilters() {
    setQuery(""); setWardId(""); setCdaId(""); setGender("");
  }

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">LGA overview</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {user.full_name}. Here&rsquo;s the full registry.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <StatCard label="Properties" value={properties.length} />
        <StatCard label="Verified" value={counts.verified} tone="text-verified" />
        <StatCard label="Pending" value={counts.pending} tone="text-pending" />
        <StatCard label="Flagged" value={counts.flagged} tone="text-flagged" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-7">
        <div className="card">
          <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Community at a glance</h2></div>
          <div className="card-body grid grid-cols-2 gap-4">
            <StatCard label="Owners" value={counts.owners} />
            <StatCard label="Tenants" value={counts.residents} />
            <StatCard label="CDA members" value={counts.cdaMembers} />
            <StatCard label="LG Staff" value={counts.admins} />
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
            {flagged.map((p) => (
              <div key={p.id} className="card-body flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5"><Stamp id={p.property_number} status="flagged" /></div>
                  <p className="text-sm text-ink mt-1.5">{p.address} · {p.owner?.full_name}</p>
                  <p className="text-xs text-muted mt-0.5">{p.flag_note}</p>
                </div>
                <a href={`${REGISTRY_URL}/property/${p.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm shrink-0">Review ↗</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">All residents</h2>
          <span className="text-xs text-muted shrink-0">{results.length} of {residents.length}</span>
        </div>

        <FilterBar activeCount={activeFilterCount} onClear={clearFilters}>
          <SearchField value={query} onChange={setQuery} placeholder="Name, resident or property ID" />
          <FilterFields>
            <select className="select-field" value={wardId} onChange={(e) => { setWardId(e.target.value); setCdaId(""); }}>
              <option value="">All wards</option>
              {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="select-field" value={cdaId} onChange={(e) => setCdaId(e.target.value)}>
              <option value="">All CDAs</option>
              {cdaOptionsForFilter.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="select-field col-span-2 sm:col-span-1" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">All genders</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g} className="capitalize">{g}</option>)}
            </select>
          </FilterFields>
        </FilterBar>

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
                  const property = r.properties;
                  const w = wards.find((x) => x.id === property?.ward_id);
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
                      <td><a href={`${REGISTRY_URL}/resident/${r.id}`} target="_blank" rel="noopener noreferrer" className="text-brass font-medium hover:underline">View ↗</a></td>
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