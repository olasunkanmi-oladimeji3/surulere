"use client";

import { useState } from "react";
import Link from "next/link";
import { useRequireRole } from "@/lib/useRequireRole";
import { WARDS, getCdasForWard, searchResidents, formatDate, statusLabel, GENDER_OPTIONS } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";

export default function CdaDashboard() {
  const { user, db, ready } = useRequireRole("cda");
  const [query, setQuery] = useState("");
  const [cdaId, setCdaId] = useState("");
  const [gender, setGender] = useState("");

  if (!ready) return <PageLoading />;

  const ward = WARDS.find((w) => w.id === user.ward_id);
  const wardCdas = getCdasForWard(user.ward_id);
  const wardProperties = db.properties.filter((p) => p.ward_id === user.ward_id);
  const results = searchResidents(db, { query, wardId: user.ward_id, cdaId, gender });

  const verified = wardProperties.filter((p) => p.status === "verified").length;
  const pending = wardProperties.filter((p) => p.status === "pending").length;
  const flagged = wardProperties.filter((p) => p.status === "flagged").length;
  const myLogs = db.verificationLogs.filter((l) => l.actorId === user.id).slice().reverse().slice(0, 5);

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">My ward</h1>
        <p className="text-sm text-muted mt-1">
          Welcome back, {user.name.split(" ")[0]}. You&rsquo;re assigned to <strong>{ward?.name}</strong>,
          covering {wardCdas.length} CDAs.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-7">
        <StatCard label="Verified properties" value={verified} tone="text-verified" />
        <StatCard label="Pending review" value={pending} tone="text-pending" />
        <StatCard label="Flagged" value={flagged} tone="text-flagged" />
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <h2 className="font-display text-base text-ink font-semibold">Residents in {ward?.name}</h2>
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
            <select className="field-input py-1.5 text-sm" value={cdaId} onChange={(e) => setCdaId(e.target.value)}>
              <option value="">All CDAs</option>
              {wardCdas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <tr><th>Resident</th><th>Property</th><th>Gender</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const property = db.properties.find((p) => p.id === r.property_id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <p className="font-mono text-xs text-ink">{r.resident_id}</p>
                        <p className="text-ink">{r.first_name} {r.last_name}</p>
                      </td>
                      <td className="text-muted font-mono text-xs">{property?.property_number || "—"}</td>
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

      <div className="card mt-7">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Your recent visits</h2></div>
        {myLogs.length === 0 ? (
          <EmptyState icon="search" title="No visits logged yet" body="Open a property profile and log a visit once you've checked the address." />
        ) : (
          <div className="divide-y divide-line">
            {myLogs.map((log) => (
              <div key={log.id} className="card-body">
                <div className="flex items-center gap-2.5">
                  <Stamp id={statusLabel(log.outcome)} status={log.outcome} hideDot />
                  <span className="text-xs text-muted">{formatDate(log.date)}</span>
                </div>
                <p className="text-sm text-text mt-1.5">{log.note}</p>
              </div>
            ))}
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
