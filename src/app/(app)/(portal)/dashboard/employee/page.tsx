import { PageHeader } from "@/shared/components/data/page-header";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import {
  getDashboardStats,
  requireRole,
} from "@/features/dashboard/services/dashboard.service";

export default async function EmployeeDashboardPage() {
  const profile = await requireRole(["EMPLOYEE"]);
  const stats = await getDashboardStats(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description={`Welcome back, ${profile.full_name}. Your work summary.`}
      />
      <DashboardOverview role={profile.role} stats={stats} />
    </div>
  );
}
