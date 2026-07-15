import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/registry";
import { getResidentDetail, computeResidentAccess } from "@/lib/queries/residents";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import Link from "next/link";
import ResidentProfileClient from "./ResidentProfileClient";

export default async function ResidentProfilePage({ params, searchParams }) {
  const { id } = await params;
  const { type = "real" } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");

  const resident = await getResidentDetail(supabase, id, type);
  if (!resident) {
    return (
      <Shell user={profile}>
        <Link href="/residents" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="text-sm text-muted mt-4">No resident found with that ID.</p>
      </Shell>
    );
  }

  const access = await computeResidentAccess(supabase, profile, resident);
  if (!access.hasAccess) {
    return (
      <Shell user={profile}>
        <Link href="/residents" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="card card-body mt-4">
          <p className="font-medium text-ink">Access restricted</p>
          <p className="text-sm text-muted mt-1">This resident isn&rsquo;t one you&rsquo;re assigned to view.</p>
        </div>
      </Shell>
    );
  }

  return <ResidentProfileClient user={profile} resident={resident} />;
}