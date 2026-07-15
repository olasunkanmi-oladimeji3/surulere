import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getAuditLog } from "@/lib/queries/registry";
import AuditLogClient from "./AuditLogClient";

export default async function AuditLogPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.role !== "admin") redirect(profile ? `/dashboard/${profile.role}` : "/login");

  const logs = await getAuditLog(supabase);

  return <AuditLogClient user={profile} logs={logs} />;
}