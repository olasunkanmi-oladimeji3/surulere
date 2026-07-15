// app/properties/page.js  (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getProperties, getWards } from "@/lib/queries/registry";
import PropertiesClient from "./PropertiesClient";

export default async function PropertiesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.role !== "admin") redirect("/");

  const [properties, wards] = await Promise.all([
    getProperties(supabase),
    getWards(supabase),
  ]);

  return <PropertiesClient user={profile} properties={properties} wards={wards} />;
}