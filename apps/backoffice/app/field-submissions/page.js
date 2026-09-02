"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import { WARDS } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import PageLoading from "@/components/PageLoading";
import FilterBar, { SearchField, FilterFields } from "@/components/FilterBar";

const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL || "http://localhost:3000/registry";

async function fetchFieldSubmissions(supabase, { wardId, status }) {
  let q = supabase
    .from("properties")
    .select("id, property_number, address, status, created_at, field_agent_name, field_agent_phone, ward_id, property_images, field_residents(id, resident_ref, first_name, last_name, phone, nin, is_head, status)")
    .not("field_agent_name", "is", null) // only field-form submissions
    .order("created_at", { ascending: false });

  if (wardId) q = q.eq("ward_id", wardId);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export default function FieldSubmissionsPage() {
  const { user, ready } = useRequireRole("admin");
  const { supabase } = useAuth();
  const [wardFilter, setWardFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  const { data: submissions, error, mutate } = useSWR(
    user ? ["field-submissions", user.id, wardFilter, statusFilter] : null,
    () => fetchFieldSubmissions(supabase, { wardId: wardFilter, status: statusFilter })
  );

  if (!ready) return <PageLoading />;

  async function updateStatus(propertyId, newStatus) {
    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", propertyId);
    if (error) { alert(error.message); return; }
    mutate();
  }

  const list = (submissions || []).filter((p) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const haystack = [p.property_number, p.address, p.field_agent_name].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(q);
  });

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">Field submissions</h1>
        <p className="text-sm text-muted mt-1">
          Properties and residents collected by CDA members using the field form.
          Review each one and verify or flag it.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <FilterBar
          activeCount={[query.trim(), wardFilter, statusFilter].filter(Boolean).length}
          onClear={() => { setQuery(""); setWardFilter(""); setStatusFilter(""); }}
        >
          <SearchField value={query} onChange={setQuery} placeholder="Address, property ID, agent name" />
          <FilterFields>
            <select className="select-field" value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}>
              <option value="">All wards</option>
              {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select className="select-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="flagged">Flagged</option>
            </select>
          </FilterFields>
          <span className="text-xs text-muted sm:ml-2">{list.length} result{list.length !== 1 ? "s" : ""}</span>
        </FilterBar>
      </div>

      {error && <p className="field-error mb-4">{error.message}</p>}

      {list.length === 0 && !error ? (
        <div className="card">
          <EmptyState
            icon="search"
            title="No field submissions"
            body="When CDA members submit the field form, their submissions appear here for review."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const isOpen = expanded === p.id;
            const ward = WARDS.find((w) => w.id === p.ward_id);
            const residents = p.field_residents || [];
            return (
              <div key={p.id} className="card">
                {/* Header row */}
                <div
                  className="card-body flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Stamp id={p.property_number} status={p.status} />
                      <span className="text-xs text-muted">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <p className="font-display text-base text-ink mt-1.5">{p.address}</p>
                    <p className="text-xs text-muted">
                      {ward?.name} · Filed by <strong>{p.field_agent_name}</strong>
                      {p.field_agent_phone ? ` · ${p.field_agent_phone}` : ""}
                      · {residents.length} resident{residents.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(p.id, "verified"); }}
                          className="btn-secondary text-sm text-verified border-verified/40 hover:bg-verified-tint"
                        >
                          <Icon name="check" className="h-3.5 w-3.5" /> Verify
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(p.id, "flagged"); }}
                          className="btn-secondary text-sm text-flagged border-flagged/40 hover:bg-flagged-tint"
                        >
                          <Icon name="flag" className="h-3.5 w-3.5" /> Flag
                        </button>
                      </>
                    )}
                    {p.status !== "pending" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(p.id, "pending"); }}
                        className="btn-ghost text-xs px-2.5 py-1.5"
                      >
                        Reset to pending
                      </button>
                    )}
                    <Icon name={isOpen ? "arrowLeft" : "plus"} className="h-4 w-4 text-muted rotate-90" />
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-line">
                    {/* Photos */}
                    {p.property_images?.length > 0 && (
                      <div className="card-body border-b border-line">
                        <p className="text-xs text-muted uppercase tracking-wide mb-2">Property photos</p>
                        <div className="grid grid-cols-4 gap-2">
                          {p.property_images.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase storage URL */}
                              <img
                                src={url}
                                alt={`Photo ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-[var(--radius-card)] border border-line hover:opacity-90"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Residents */}
                    {residents.length > 0 && (
                      <div className="card-body">
                        <p className="text-xs text-muted uppercase tracking-wide mb-3">Residents collected</p>
                        <div className="space-y-3">
                          {residents.map((r) => (
                            <div key={r.id} className="card card-body bg-paper py-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-ink">{r.resident_ref}</span>
                                    {r.is_head && <span className="pill-brass text-xs">Head of household</span>}
                                  </div>
                                  <p className="text-sm font-medium text-ink mt-0.5">{r.first_name} {r.last_name}</p>
                                  <p className="text-xs text-muted">{r.phone}</p>
                                  {r.nin && (
                                    <p className="text-xs text-muted font-mono">
                                      NIN: {r.nin}
                                    </p>
                                  )}
                                </div>
                                <Stamp id={r.status} status={r.status} hideDot />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="card-body border-t border-line">
                      <a href={`${REGISTRY_URL}/property/${p.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brass hover:underline">
                        Open full property record ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}