import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { EodReviewPanel } from "@/features/eod/components/eod-review-panel";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { getTeamEodForReview } from "@/features/eod/services/eod.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

export default async function EodReviewPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const updates = await getTeamEodForReview(profile.id, profile.role);
  const nav = getEodNavItems(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="EOD Review"
        description="Review team daily updates and leave feedback."
      />
      <SectionNav items={nav} />
      <EodReviewPanel updates={updates} reviewerId={profile.id} />
    </div>
  );
}
