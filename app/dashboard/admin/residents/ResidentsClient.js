"use client";
import { useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import { statusLabel, GENDER_OPTIONS } from "@/lib/data";

export default function ResidentsClient({ user, residents, wards, cdas }) {
  const [query, setQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const [cdaId, setCdaId] = useState("");
  const [gender, setGender] = useState("");

  const cdaOptions = wardId ? cdas.filter((c) => c.ward_id === wardId) : cdas;

  const results = residents.filter((r) => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = [r.first_name, r.last_name, r.displayId, r.property?.property_number, r.property?.address]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (wardId && r.property?.ward_id !== wardId) return false;
    if (cdaId && r.property?.cda_id !== cdaId) return false;
    if (gender && r.gender !== gender) return false;
    return true;
  });

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">Residents</h1>
        <p className="text-sm text-muted mt-1">Everyone on the registry — real accounts and field-collected records.</p>
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h2 className="font-display text-base text-ink font-semibold">{results.length} of {residents.length}</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Icon name="search" className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="field-input pl-8 py-1.5 text-sm w-48" placeholder="Name, ID, or property" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="field-input py-1.5 text-sm" value={wardId} onChange={(e) => { setWardId(e.target.value); setCdaId(""); }}>
              <option value="">All wards</option>
              {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="field-input py-1.5 text-sm" value={cdaId} onChange={(e) => setCdaId(e.target.value)}>
              <option value="">All CDAs</option>
              {cdaOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <thead><tr><th>Resident</th><th>Property</th><th>Ward</th><th>Gender</th><th>Source</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {results.map((r) => (
                  <tr key={`${r.type}-${r.id}`}>
                    <td>
                      <p className="font-mono text-xs text-ink">{r.displayId}</p>
                      <p className="text-ink">{r.first_name} {r.last_name}</p>
                    </td>
                    <td className="text-muted">
                      <p className="font-mono text-xs">{r.property?.property_number || "—"}</p>
                      <p>{r.property?.address}</p>
                    </td>
                    <td className="text-muted">{r.property?.wards?.name}</td>
                    <td className="text-muted capitalize">{r.gender || "—"}</td>
                    <td>
                      <span className={`pill-${r.type === "field" ? "brass" : "ink"} text-xs`}>
                        {r.type === "field" ? "Field-collected" : "Registered"}
                      </span>
                    </td>
                    <td><Stamp id={statusLabel(r.status)} status={r.status} hideDot /></td>
                    <td><Link href={`/dashboard/admin/residents/${r.id}?type=${r.type}`} className="text-brass font-medium hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}