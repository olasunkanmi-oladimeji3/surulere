import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getPropertyById, getVerificationLogs, computeAccess } from "@/lib/queries/registry";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import PropertyProfileClient from "@/components/PropertyProfileClient";

export default async function PropertyProfilePage({ params }) {
  const { id: propertyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/registry/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/registry/login");

  const property = await getPropertyById(supabase, propertyId);
  if (!property) {
    return (
      <Shell user={profile}>
        <Link href="/registry/dashboard/admin/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="text-sm text-muted mt-4">No property found with that ID.</p>
      </Shell>
    );
  }

  const access = await computeAccess(supabase, profile, property);
  if (!access.hasAccess) {
    return (
      <Shell user={profile}>
        <Link href="/registry/dashboard/admin/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="card card-body mt-4">
          <p className="font-medium text-ink">Access restricted</p>
          <p className="text-sm text-muted mt-1">
            This property isn&rsquo;t one you&rsquo;re assigned to view. If you think that&rsquo;s wrong, check with LG Staff.
          </p>
        </div>
      </Shell>
    );
  }

  const logs = await getVerificationLogs(supabase, propertyId);

  return <PropertyProfileClient user={profile} property={property} access={access} logs={logs} />;
}
