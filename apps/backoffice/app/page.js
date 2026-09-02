// app/dashboard/admin/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProfile,
  getProperties,
  getWards,
  getCdas,
  getAllResidentsWithContext,
  getDashboardCounts,
} from "@/lib/queries/registry";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.role !== "admin")
    redirect("/login");

  const [properties, wards, cdas, residents, counts] = await Promise.all([
    getProperties(supabase),
    getWards(supabase),
    getCdas(supabase),
    getAllResidentsWithContext(supabase),
    getDashboardCounts(supabase),
  ]);

  return (
    <AdminDashboardClient
      user={profile}
      properties={properties}
      wards={wards}
      cdas={cdas}
      residents={residents}
      counts={counts}
    />
  );
}