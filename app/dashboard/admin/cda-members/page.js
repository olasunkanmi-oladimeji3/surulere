// app/cda-members/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getWards, getCdaMembers } from "@/lib/queries/registry";
import CdaMembersClient from "./CdaMembersClient";

export default async function CdaMembersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.role !== "admin") redirect(profile ? `/dashboard/${profile.role}` : "/login");

  const [members, wards] = await Promise.all([getCdaMembers(supabase), getWards(supabase)]);

  return <CdaMembersClient user={profile} members={members} wards={wards} />;
}