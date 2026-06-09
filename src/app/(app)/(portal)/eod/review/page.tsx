import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { EodReviewPanel } from "@/features/eod/components/eod-review-panel";
import { getTeamEodForReview } from "@/features/eod/services/eod.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

const EOD_NAV = [
  { label: "Dashboard", href: "/eod" },
  { label: "Review", href: "/eod/review" },
  { label: "History", href: "/eod/history" },
];

export default async function EodReviewPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const updates = await getTeamEodForReview(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="EOD Review"
        description="Review team daily updates and leave feedback."
      />
      <SectionNav items={EOD_NAV} />
      <EodReviewPanel updates={updates} reviewerId={profile.id} />
    </div>
  );
}
