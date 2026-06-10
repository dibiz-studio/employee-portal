import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { ApplyLeaveForm } from "@/features/leave/components/apply-leave-form";
import { getActiveLeavePoliciesForEmployee } from "@/features/leave/services/leave.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

const LEAVE_NAV = [
  { label: "Overview", href: "/leave" },
  { label: "Apply", href: "/leave/apply" },
  { label: "History", href: "/leave/history" },
  { label: "Calendar", href: "/leave/calendar" },
];

export default async function ApplyLeavePage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const policies = await getActiveLeavePoliciesForEmployee(profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request for approval."
      />
      <SectionNav items={LEAVE_NAV} />
      <ApplyLeaveForm employeeId={profile.id} policies={policies} />
    </div>
  );
}
