import { notFound } from "next/navigation";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getEmployeePayroll } from "@/features/payroll/services/payroll.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
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
import { createClient } from "@/shared/lib/supabase/server";
import { formatCurrency, formatMonthYear } from "@/shared/lib/utils";

interface EmployeePayrollPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeePayrollPage({
  params,
}: EmployeePayrollPageProps) {
  const profile = await getServerProfile();
  if (!profile) return null;

  const { id } = await params;
  const records = await getEmployeePayroll(id, profile.role, profile.id);

  if (records.length === 0) {
    const supabase = await createClient();
    const { data: employee } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", id)
      .single();

    if (!employee) notFound();
  }

  const employeeName = records[0]?.employee_name ?? "Employee";
  const isIntern = profile.role === "INTERN" && profile.id === id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payroll — ${employeeName}`}
        description="Salary breakdown and payment history."
      />

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No payroll records found for this employee.
        </p>
      ) : (
        records.map((record) => (
          <Card key={record.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {formatMonthYear(record.period_month, record.period_year)}
              </CardTitle>
              <StatusBadge status={record.status} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(record.base_salary)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gross Pay</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(record.gross_pay)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Pay</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(record.net_pay)}
                  </p>
                </div>
              </div>

              {!isIntern ? (
                <>
                  <div>
                    <p className="mb-2 text-sm font-medium">Allowances</p>
                    <Table>
                      <TableBody>
                        {Object.entries(record.allowances).map(([key, val]) => (
                          <TableRow key={key}>
                            <TableCell className="capitalize">{key}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(val)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Deductions</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(record.deductions).map(([key, val]) => (
                          <TableRow key={key}>
                            <TableCell className="capitalize">{key}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(val)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {record.leave_deduction > 0 ? (
                          <TableRow>
                            <TableCell>Leave Deduction</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(record.leave_deduction)}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Detailed deductions are hidden for intern accounts.
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
