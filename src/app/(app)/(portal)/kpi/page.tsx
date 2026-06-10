import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Plus,
  Target,
  Trophy,
} from "lucide-react";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { KpiChart } from "@/features/kpi/components/kpi-chart";
import { KpiProgressCard } from "@/features/kpi/components/kpi-progress-card";
import {
  getEmployeeKpis,
  getKpiCategoryBreakdown,
  getKpiDashboardStats,
  getKpiTrendData,
} from "@/features/kpi/services/kpi.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatCard } from "@/shared/components/data/stat-card";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function KpiDashboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const [stats, kpis, trendData, categoryData] = await Promise.all([
    getKpiDashboardStats(profile.role, profile.id),
    getEmployeeKpis(profile.role, profile.id),
    getKpiTrendData(profile.role, profile.id),
    getKpiCategoryBreakdown(profile.role, profile.id),
  ]);

  const canManage = ["SUPER_ADMIN", "HR"].includes(profile.role);
  const canAssign = ["SUPER_ADMIN", "HR", "MANAGER"].includes(profile.role);

  const categoryChartData = categoryData.map((c) => ({
    label: c.category,
    value: c.avgProgress,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Dashboard"
        description="Track performance goals and progress across your scope"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/kpi/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/kpi/leaderboard">
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
            {canManage ? (
              <Button variant="outline" asChild>
                <Link href="/kpi/templates">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Templates
                </Link>
              </Button>
            ) : null}
            {canAssign ? (
              <Button asChild>
                <Link href="/kpi/assign">
                  <Plus className="mr-2 h-4 w-4" />
                  Assign KPI
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total KPIs" value={stats.total} icon={Target} />
        <StatCard title="On track" value={stats.onTrack} icon={CheckCircle2} />
        <StatCard title="At risk" value={stats.atRisk} icon={AlertTriangle} />
        <StatCard
          title="Avg completion"
          value={`${stats.avgCompletion}%`}
          icon={BarChart3}
          description="Active KPIs"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <KpiChart
          title="Progress by status"
          description="Average completion per status"
          data={trendData}
          variant="area"
        />
        <KpiChart
          title="By category"
          description="Average progress per category"
          data={categoryChartData}
          variant="bar"
          valueLabel="Avg %"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active KPIs</CardTitle>
          <CardDescription>
            {kpis.length === 0
              ? "No KPIs assigned yet"
              : `Showing ${kpis.length} KPI${kpis.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No KPIs assigned"
              description="Assign KPIs to start tracking performance goals."
              actionLabel={canAssign ? "Assign KPI" : undefined}
              actionHref={canAssign ? "/kpi/assign" : undefined}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiProgressCard key={kpi.id} kpi={kpi} showEmployee href={`/kpi/${kpi.id}`} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

