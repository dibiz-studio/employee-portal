import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getCompanyStats } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { APP_NAME } from "@/shared/lib/constants";

export default async function CompanySettingsPage() {
  await requireRole(["SUPER_ADMIN"]);
  const stats = await getCompanyStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Settings"
        description="Organization overview and configuration."
      />

      <Card>
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Company-wide settings are managed at the organization level.
            Configure departments, roles, and policies from the settings hub.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Employees" value={stats.employees} />
        <StatCard title="Departments" value={stats.departments} />
        <StatCard title="Leave Policies" value={stats.leavePolicies} />
      </div>
    </div>
  );
}
