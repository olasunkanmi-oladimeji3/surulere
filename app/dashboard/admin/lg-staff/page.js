"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRequireRole } from "@/lib/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import AddAdminModal from "@/components/AddAdminModal";
import PageLoading from "@/components/PageLoading";

async function fetchAdminProfiles(supabase) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export default function LgStaffPage() {
  const { user, ready } = useRequireRole("admin");
  const { supabase } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: staffList, error, mutate } = useSWR(
    user ? ["admin-profiles", user.id] : null,
    () => fetchAdminProfiles(supabase)
  );

  if (!ready) return <PageLoading />;

  async function removeStaff(staffId) {
    if (staffId === user.id) {
      alert("You can't remove your own account.");
      return;
    }
    if (!confirm("Remove this staff member's access? They won't be able to log in afterwards.")) return;

    const res = await fetch(`/api/admin/remove-staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: staffId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to remove staff member.");
      return;
    }
    mutate();
  }

  const staff = staffList || [];

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink font-semibold">LG Staff</h1>
          <p className="text-sm text-muted mt-1">
            Staff accounts have full access — every property, resident profile, and NIN across the LGA.
            Only add people who actually need that.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Icon name="plus" /> Add staff member
        </button>
      </div>

      {error && <p className="field-error mb-4">Couldn&rsquo;t load staff list: {error.message}</p>}

      <div className="card">
        {staff.length === 0 && !error ? (
          <EmptyState icon="users" title="No staff accounts yet" body="Add the first LG Staff member above." />
        ) : (
          <div className="divide-y divide-line">
            {staff.map((s) => (
              <div key={s.id} className="card-body flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{s.full_name}</p>
                    {s.id === user.id && (
                      <span className="pill-brass text-xs">You</span>
                    )}
                  </div>
                  {s.title && <p className="text-xs text-muted mt-0.5">{s.title}</p>}
                  <p className="text-xs text-muted">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
                </div>
                {s.id !== user.id && (
                  <button onClick={() => removeStaff(s.id)} className="btn-danger text-sm shrink-0">
                    <Icon name="trash" className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => mutate()}
      />
    </Shell>
  );
}