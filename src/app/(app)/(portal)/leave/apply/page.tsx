import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { ApplyLeaveForm } from "@/features/leave/components/apply-leave-form";
import { getLeaveNavItems } from "@/features/leave/lib/leave-nav";
import { getActiveLeavePoliciesForEmployee } from "@/features/leave/services/leave.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

export default async function ApplyLeavePage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const policies = await getActiveLeavePoliciesForEmployee(profile.id);
  const nav = getLeaveNavItems(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request for approval."
      />
      <SectionNav items={nav} />
      <ApplyLeaveForm employeeId={profile.id} policies={policies} />
    </div>
  );
}
