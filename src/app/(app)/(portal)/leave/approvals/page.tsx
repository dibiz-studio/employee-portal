import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { LeaveApprovalsPanel } from "@/features/leave/components/leave-approvals-panel";
import { getPendingLeaveApprovals } from "@/features/leave/services/leave.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

const LEAVE_NAV = [
  { label: "Overview", href: "/leave" },
  { label: "Approvals", href: "/leave/approvals" },
  { label: "Analytics", href: "/leave/analytics" },
];

export default async function LeaveApprovalsPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const requests = await getPendingLeaveApprovals(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals"
        description="Review and approve pending leave requests from your team."
      />
      <SectionNav items={LEAVE_NAV} />
      <LeaveApprovalsPanel requests={requests} reviewerId={profile.id} />
    </div>
  );
}
