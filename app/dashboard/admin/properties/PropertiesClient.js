// app/properties/PropertiesClient.js  ("use client")
"use client";
import { useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";

export default function PropertiesClient({ user, properties, wards }) {
  const [query, setQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const [status, setStatus] = useState("");

  const results = properties.filter((p) => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = [p.property_number, p.address, p.owner?.full_name].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (wardId && p.ward_id !== wardId) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">Properties</h1>
        <p className="text-sm text-muted mt-1">Every property on the registry, by address rather than by resident.</p>
      </div>
      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h2 className="font-display text-base text-ink font-semibold">{results.length} of {properties.length}</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon name="search" className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="field-input pl-8 py-1.5 text-sm w-48" placeholder="Address, owner, property ID" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="field-input py-1.5 text-sm" value={wardId} onChange={(e) => setWardId(e.target.value)}>
              <option value="">All wards</option>
              {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="field-input py-1.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending review</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
        {results.length === 0 ? (
          <EmptyState icon="house" title="No properties match" body="Try a different search term or clear the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead><tr><th>Property</th><th>Owner</th><th>Ward</th><th>Units</th><th>Occupied</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {results.map((p) => {
                  const occupied = p.units.filter((u) => u.occupancy === "occupied").length;
                  return (
                    <tr key={p.id}>
                      <td>
                        <p className="font-mono text-xs text-ink">{p.property_number}</p>
                        <p className="text-ink">{p.address}</p>
                        <p className="text-xs text-muted">Added {new Date(p.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="text-muted">{p.owner?.full_name || "—"}</td>
                      <td className="text-muted">{p.ward?.name}</td>
                      <td className="text-muted">{p.units.length}</td>
                      <td className="text-muted">{occupied}/{p.units.length}</td>
                      <td><Stamp id={p.status} status={p.status} hideDot /></td>
                      <td><Link href={`/dashboard/admin/properties/${p.id}`} className="text-brass font-medium hover:underline">View</Link></td>
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