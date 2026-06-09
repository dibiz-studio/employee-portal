import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { PdfPreviewDialog } from "@/features/reports/components/pdf-preview-dialog";
import { getOrganizationReportData } from "@/features/reports/services/reports.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatCurrency, formatDateTime } from "@/shared/lib/utils";

export default async function OrganizationReportPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const data = await getOrganizationReportData();

  const pdfData = {
    title: "Organization Report",
    subtitle: `Generated ${formatDateTime(data.generatedAt)} · ${data.period}`,
    sections: [
      { label: "Active Employees", value: String(data.employeeCount) },
      { label: "Departments", value: String(data.departmentCount) },
      { label: "Pending Leave Requests", value: String(data.pendingLeaves) },
      { label: "Active KPIs", value: String(data.activeKpis) },
    ],
    rows: [
      { label: "Payroll Records (current month)", value: String(data.payrollRecords) },
      { label: "Total Gross Pay", value: formatCurrency(data.totalGrossPay) },
      { label: "Total Net Pay", value: formatCurrency(data.totalNetPay) },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Report"
        description={`Summary for ${data.period}.`}
        actions={<PdfPreviewDialog data={pdfData} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Employees" value={data.employeeCount} />
        <StatCard title="Departments" value={data.departmentCount} />
        <StatCard title="Pending Leaves" value={data.pendingLeaves} />
        <StatCard title="Active KPIs" value={data.activeKpis} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary — {data.period}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Records</p>
            <p className="text-2xl font-semibold">{data.payrollRecords}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(data.totalGrossPay)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Net</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(data.totalNetPay)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
