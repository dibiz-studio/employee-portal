import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { KpiChart } from "@/features/kpi/components/kpi-chart";
import {
  getKpiCategoryBreakdown,
  getKpiDashboardStats,
  getKpiTrendData,
} from "@/features/kpi/services/kpi.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function KpiAnalyticsPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const [stats, trendData, categoryData] = await Promise.all([
    getKpiDashboardStats(profile.role, profile.id),
    getKpiTrendData(profile.role, profile.id),
    getKpiCategoryBreakdown(profile.role, profile.id),
  ]);

  const statusChartData = trendData.map((d) => ({
    label: d.label,
    value: d.value,
  }));

  const categoryChartData = categoryData.map((c) => ({
    label: c.category,
    value: c.count,
  }));

  const progressChartData = categoryData.map((c) => ({
    label: c.category,
    value: c.avgProgress,
    target: 100,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Analytics"
        description="Performance trends and category breakdowns"
        backHref="/kpi"
        backLabel="Back to KPI dashboard"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total KPIs" value={stats.total} icon={Target} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard title="In progress" value={stats.inProgress} icon={TrendingUp} />
        <StatCard title="At risk" value={stats.atRisk} icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <KpiChart
          title="Status distribution"
          description="Average progress by KPI status"
          data={statusChartData}
          variant="area"
        />
        <KpiChart
          title="KPI count by category"
          description="Number of KPIs per category"
          data={categoryChartData}
          variant="bar"
          valueLabel="Count"
        />
      </div>

      <KpiChart
        title="Category performance"
        description="Average completion rate per category vs 100% target"
        data={progressChartData}
        variant="area"
      />

      <Card>
        <CardHeader>
          <CardTitle>Category summary</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {categoryData.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No KPI data available for analytics yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>KPI count</TableHead>
                  <TableHead>Avg progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="font-medium">{row.category}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>{row.avgProgress}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
