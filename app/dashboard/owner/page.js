"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOwnerProperties } from "@/lib/supabaseData";
import { formatDate } from "@/lib/data";
import Shell from "@/components/Shell";
import Stamp from "@/components/Stamp";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import AddPropertyModal from "@/components/AddPropertyModal";
import PageLoading from "@/components/PageLoading";

export default function OwnerDashboard() {
  const { user, ready } = useRequireRole("owner");
  const { supabase } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: properties, error, isLoading, mutate } = useSWR(
    ready ? ["owner-properties", user.id] : null,
    () => fetchOwnerProperties(supabase, user.id)
  );

  if (!ready || isLoading) return <PageLoading />;

  const safeProperties = properties || [];
  const totalUnits = safeProperties.reduce((n, p) => n + p.units.length, 0);
  const occupied = safeProperties.reduce((n, p) => n + p.units.filter((u) => !!u.tenant_id).length, 0);
  const vacant = totalUnits - occupied;

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink font-semibold">My properties</h1>
          <p className="text-sm text-muted mt-1">
            Welcome back, {(user.full_name || "").split(" ")[0]}. Here&rsquo;s everything registered under your name.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Icon name="plus" /> Add property
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-7">
        <StatCard label="Properties" value={safeProperties.length} />
        <StatCard label="Tenants in place" value={occupied} />
        <StatCard label="Vacant units" value={vacant} />
      </div>

      {error && <p className="field-error mb-4">{error.message || "Couldn't load your properties."}</p>}

      <div className="space-y-3">
        {safeProperties.length === 0 ? (
          <EmptyState
            icon="building"
            title="No properties yet"
            body="Add your first property to get it on the registry and start adding tenants."
          />
        ) : (
          safeProperties.map((p) => (
            <PropertyCard key={p.id} property={p} onView={() => router.push(`/property/${p.id}`)} />
          ))
        )}
      </div>

      <AddPropertyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ownerId={user.id}
        onAdded={() => mutate()}
      />
    </Shell>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card card-body py-4">
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl text-ink font-semibold mt-1">{value}</p>
    </div>
  );
}

function PropertyCard({ property: p, onView }) {
  const occupied = p.units.filter((u) => !!u.tenant_id).length;
  return (
    <div className="card card-body flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Stamp id={p.property_number} status={p.status} />
          <span className="text-xs text-muted">Added {formatDate(p.created_at)}</span>
        </div>
        <p className="font-display text-base text-ink mt-2">{p.address}</p>
        <p className="text-sm text-muted">{p.wards?.name}</p>
      </div>
      <div className="flex items-center gap-5 shrink-0">
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{p.units.length} unit{p.units.length === 1 ? "" : "s"}</p>
          <p className="text-xs text-muted">{occupied} occupied</p>
        </div>
        <button onClick={onView} className="btn-secondary text-sm">View profile</button>
      </div>
    </div>
  );
}