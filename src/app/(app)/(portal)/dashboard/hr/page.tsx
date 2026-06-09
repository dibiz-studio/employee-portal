import Link from "next/link";

import { PageHeader } from "@/shared/components/data/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { PendingOnboardingPanel } from "@/features/settings/components/pending-onboarding-panel";
import {
  getDashboardStats,
  requireRole,
} from "@/features/dashboard/services/dashboard.service";
import { getPendingOnboardingUsers } from "@/features/settings/services/settings.service";
import { Button } from "@/shared/components/ui/button";

export default async function HrDashboardPage() {
  const profile = await requireRole(["HR"]);
  const [stats, pendingUsers] = await Promise.all([
    getDashboardStats(profile.id, profile.role),
    getPendingOnboardingUsers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        description={`Welcome back, ${profile.full_name}. People operations at a glance.`}
        actions={
          pendingUsers.length > 0 ? (
            <Button asChild variant="outline">
              <Link href="/settings/roles">
                Approve {pendingUsers.length} pending user
                {pendingUsers.length === 1 ? "" : "s"}
              </Link>
            </Button>
          ) : undefined
        }
      />
      <PendingOnboardingPanel users={pendingUsers} />
      <DashboardOverview role={profile.role} stats={stats} />
    </div>
  );
}
