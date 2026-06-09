import Link from "next/link";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getPayrollSummary } from "@/features/payroll/services/payroll.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { hasPermission } from "@/shared/lib/rbac";
import { formatCurrency, formatMonthYear } from "@/shared/lib/utils";

const PAYROLL_NAV = [
  { label: "Dashboard", href: "/payroll" },
  { label: "Analytics", href: "/payroll/analytics" },
];

export default async function PayrollDashboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  if (!hasPermission(profile.role, "payroll:read")) {
    await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  }

  const summary = await getPayrollSummary(profile.id, profile.role);
  const now = new Date();
  const canManage = hasPermission(profile.role, "payroll:settings");

  const nav = [
    ...PAYROLL_NAV,
    ...(canManage ? [{ label: "Settings", href: "/payroll/settings" }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description={`Payroll overview for ${formatMonthYear(now.getMonth() + 1, now.getFullYear())}.`}
      />
      <SectionNav items={nav} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Employees" value={summary.employeeCount} />
        <StatCard
          title="Total Gross"
          value={formatCurrency(summary.totalGross)}
        />
        <StatCard title="Total Net" value={formatCurrency(summary.totalNet)} />
        <StatCard title="Processed" value={summary.processedCount} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Gross</TableHead>
            <TableHead>Net</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.employee_name}</TableCell>
              <TableCell>
                {formatMonthYear(record.period_month, record.period_year)}
              </TableCell>
              <TableCell>{formatCurrency(record.gross_pay)}</TableCell>
              <TableCell>{formatCurrency(record.net_pay)}</TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/payroll/employee/${record.employee_id}`}>
                    Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
