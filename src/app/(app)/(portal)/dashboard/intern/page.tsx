import { PageHeader } from "@/shared/components/data/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import {
  getDashboardStats,
  requireRole,
} from "@/features/dashboard/services/dashboard.service";

export default async function InternDashboardPage() {
  const profile = await requireRole(["INTERN"]);
  const stats = await getDashboardStats(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intern Dashboard"
        description={`Welcome back, ${profile.full_name}. Track your progress and tasks.`}
      />
      <DashboardOverview role={profile.role} stats={stats} />
    </div>
  );
}
