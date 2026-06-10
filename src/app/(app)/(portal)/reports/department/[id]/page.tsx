import { notFound } from "next/navigation";

import { getDepartmentReportData } from "@/features/reports/services/reports.service";
import { PdfPreviewDialog } from "@/features/reports/components/pdf-preview-dialog";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
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
import { formatDateTime } from "@/shared/lib/utils";

interface DepartmentReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartmentReportPage({
  params,
}: DepartmentReportPageProps) {
  const { id } = await params;

  let data: Awaited<ReturnType<typeof getDepartmentReportData>>;
  try {
    data = await getDepartmentReportData(id);
  } catch {
    notFound();
  }

  const pdfData = {
    title: `Department Report — ${data.department.name}`,
    subtitle: `Generated ${formatDateTime(data.generatedAt)}`,
    sections: [
      { label: "Department Head", value: data.department.head_name ?? "—" },
      { label: "Employees", value: String(data.employeeCount) },
      { label: "Leave Requests", value: String(data.leaveRequests) },
      { label: "KPI Assignments", value: String(data.activeKpis) },
      { label: "EOD Submissions", value: String(data.eodSubmissions) },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${data.department.name} Report`}
        description={data.department.description ?? `Code: ${data.department.code}`}
        actions={<PdfPreviewDialog data={pdfData} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Employees" value={data.employeeCount} />
        <StatCard title="Leave Requests" value={data.leaveRequests} />
        <StatCard title="KPIs" value={data.activeKpis} />
        <StatCard title="EOD Submissions" value={data.eodSubmissions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.employees.map((emp, i) => (
                <TableRow key={i}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.job_title}</TableCell>
                  <TableCell>{emp.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
