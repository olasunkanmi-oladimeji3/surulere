import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getWards, getCdas } from "@/lib/queries/registry";
import { getResidentsForViewer } from "@/lib/queries/residents";
import ResidentsClient from "./ResidentsClient";

export default async function ResidentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");
  if (profile.role === "resident") redirect("/login"); // residents view their own profile elsewhere

  const [residents, wards, cdas] = await Promise.all([
    getResidentsForViewer(supabase, profile),
    getWards(supabase),
    getCdas(supabase),
  ]);

  return <ResidentsClient user={profile} residents={residents} wards={wards} cdas={cdas} />;
}