import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getPayrollAnalytics } from "@/features/payroll/services/payroll.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Card,
  CardContent,
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
import { formatCurrency } from "@/shared/lib/utils";

const PAYROLL_NAV = [
  { label: "Overview", href: "/payroll" },
  { label: "Analytics", href: "/payroll/analytics" },
];

export default async function PayrollAnalyticsPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR"]);
  const analytics = await getPayrollAnalytics(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Payroll Analytics"
        description="Department breakdown and payroll status distribution."
      />
      <SectionNav items={PAYROLL_NAV} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Records" value={analytics.totalRecords} />
        <StatCard
          title="Total Gross"
          value={formatCurrency(analytics.totalGross)}
        />
        <StatCard
          title="Total Net"
          value={formatCurrency(analytics.totalNet)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By Department</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.byDepartment.map((dept) => (
                  <TableRow key={dept.name}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.count}</TableCell>
                    <TableCell>{formatCurrency(dept.gross)}</TableCell>
                    <TableCell>{formatCurrency(dept.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.byStatus.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
