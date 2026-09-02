import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/registry";
import { navHrefFor } from "@/lib/data";
import { getResidentDetail, computeResidentAccess } from "@/lib/queries/residents";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import ResidentProfileClient from "@/components/ResidentProfileClient";

export default async function ResidentProfilePage({ params, searchParams }) {
  const { id } = await params;
  const { type = "real" } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/registry/login");
  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/registry/login");

  const backHref = navHrefFor(profile.role);
  const resident = await getResidentDetail(supabase, id, type);
  if (!resident) {
    return (
      <Shell user={profile}>
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
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
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="card card-body mt-4">
          <p className="font-medium text-ink">Access restricted</p>
          <p className="text-sm text-muted mt-1">
            This resident isn&rsquo;t one you&rsquo;re assigned to view. If you think that&rsquo;s wrong, check with LG Staff.
          </p>
        </div>
      </Shell>
    );
  }

  return <ResidentProfileClient user={profile} resident={resident} access={access} backHref={backHref} />;
}
