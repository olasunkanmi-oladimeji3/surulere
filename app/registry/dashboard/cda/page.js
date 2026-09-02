"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import { getCdaWardId, getResidentsForViewer } from "@/lib/queries/residents";
import { getWards, getCdas, getPropertyStatusCountsForWard, getVerificationLogsByActor } from "@/lib/queries/registry";
import { statusLabel, GENDER_OPTIONS } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";
import FilterBar, { SearchField, FilterFields } from "@/components/FilterBar";

async function fetchCdaOverview(supabase, profile) {
  const wardId = await getCdaWardId(supabase, profile.id);
  if (!wardId) return { wardId: null };

  const [wards, cdas, counts, residents, logs] = await Promise.all([
    getWards(supabase),
    getCdas(supabase),
    getPropertyStatusCountsForWard(supabase, wardId),
    getResidentsForViewer(supabase, profile),
    getVerificationLogsByActor(supabase, profile.id, 5),
  ]);

  return {
    wardId,
    ward: wards.find((w) => w.id === wardId) || null,
    wardCdas: cdas.filter((c) => c.ward_id === wardId),
    counts,
    residents,
    logs,
  };
}

export default function CdaDashboard() {
  const { user, ready } = useRequireRole("cda");
  const { supabase } = useAuth();
  const [query, setQuery] = useState("");
  const [cdaId, setCdaId] = useState("");
  const [gender, setGender] = useState("");

  const { data, error, isLoading } = useSWR(
    ready ? ["cda-overview", user.id] : null,
    () => fetchCdaOverview(supabase, user)
  );

  if (!ready || isLoading) return <PageLoading />;
  if (error) {
    return (
      <Shell user={user}>
        <p className="field-error">Couldn&rsquo;t load your ward. Try again shortly.</p>
      </Shell>
    );
  }
  if (!data?.wardId) {
    return (
      <Shell user={user}>
        <div className="card">
          <EmptyState icon="shield" title="No ward assigned" body="Your account isn't assigned to a ward yet — check with LG Staff." />
        </div>
      </Shell>
    );
  }

  const { ward, wardCdas, counts, residents, logs } = data;

  const results = residents.filter((r) => {
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const haystack = [r.first_name, r.last_name, r.displayId, r.property?.property_number].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (cdaId && r.property?.cda_id !== cdaId) return false;
    if (gender && r.gender !== gender) return false;
    return true;
  });

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">My ward</h1>
        <p className="text-sm text-muted mt-1">
          Welcome back, {(user.full_name || "").split(" ")[0]}. You&rsquo;re assigned to <strong>{ward?.name}</strong>,
          covering {wardCdas.length} CDA{wardCdas.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-7">
        <StatCard label="Verified properties" value={counts.verified} tone="text-verified" />
        <StatCard label="Pending review" value={counts.pending} tone="text-pending" />
        <StatCard label="Flagged" value={counts.flagged} tone="text-flagged" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-base text-ink font-semibold">Residents in {ward?.name}</h2>
        </div>

        <FilterBar activeCount={[query.trim(), cdaId, gender].filter(Boolean).length} onClear={() => { setQuery(""); setCdaId(""); setGender(""); }}>
          <SearchField value={query} onChange={setQuery} placeholder="Name, resident or property ID" />
          <FilterFields>
            <select className="select-field" value={cdaId} onChange={(e) => setCdaId(e.target.value)}>
              <option value="">All CDAs</option>
              {wardCdas.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="select-field" value={gender} onChange={(e) => setGender(e.target.value)}>
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
                <tr><th>Resident</th><th>Property</th><th>Gender</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={`${r.type}-${r.id}`}>
                    <td>
                      <p className="font-mono text-xs text-ink">{r.displayId}</p>
                      <p className="text-ink">{r.first_name} {r.last_name}</p>
                    </td>
                    <td className="text-muted font-mono text-xs">{r.property?.property_number || "—"}</td>
                    <td className="text-muted capitalize">{r.gender || "—"}</td>
                    <td><Stamp id={statusLabel(r.status)} status={r.status} hideDot /></td>
                    <td><Link href={`/registry/resident/${r.id}?type=${r.type}`} className="text-brass font-medium hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-7">
        <div className="card-header"><h2 className="font-display text-base text-ink font-semibold">Your recent visits</h2></div>
        {logs.length === 0 ? (
          <EmptyState icon="search" title="No visits logged yet" body="Open a property profile and log a visit once you've checked the address." />
        ) : (
          <div className="divide-y divide-line">
            {logs.map((log) => (
              <div key={log.id} className="card-body">
                <div className="flex items-center gap-2.5">
                  <Stamp id={statusLabel(log.outcome)} status={log.outcome} hideDot />
                  <span className="text-xs text-muted">
                    {new Date(log.created_at).toLocaleDateString()} · {log.properties?.property_number}
                  </span>
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
