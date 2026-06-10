import { createClient } from "@/shared/lib/supabase/server";
import { asSingleRelation } from "@/shared/lib/utils";
import type { AppRole } from "@/shared/types/roles";

export interface PayrollRecordRow {
  id: string;
  employee_id: string;
  employee_name: string;
  period_month: number;
  period_year: number;
  base_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  leave_deduction: number;
  gross_pay: number;
  net_pay: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export async function getPayrollRecords(
  userId: string,
  role: AppRole,
  options?: { employeeId?: string; month?: number; year?: number },
): Promise<PayrollRecordRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("payroll_records")
    .select(
      "id, employee_id, period_month, period_year, base_salary, allowances, deductions, leave_deduction, gross_pay, net_pay, status, notes, created_at, profiles!payroll_records_employee_id_fkey(full_name)",
    )
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  if (options?.employeeId) {
    query = query.eq("employee_id", options.employeeId);
  } else if (role === "EMPLOYEE") {
    query = query.eq("employee_id", userId);
  } else if (role === "INTERN") {
    query = query.eq("employee_id", userId);
  }

  if (options?.month) query = query.eq("period_month", options.month);
  if (options?.year) query = query.eq("period_year", options.year);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: { employee_id: string }) => ({
    id: row.id,
    employee_id: row.employee_id,
    employee_name: asSingleRelation(row.profiles)?.full_name ?? "Unknown",
    period_month: row.period_month,
    period_year: row.period_year,
    base_salary: Number(row.base_salary),
    allowances: (row.allowances as Record<string, number>) ?? {},
    deductions: (row.deductions as Record<string, number>) ?? {},
    leave_deduction: Number(row.leave_deduction),
    gross_pay: Number(row.gross_pay),
    net_pay: Number(row.net_pay),
    status: row.status,
    notes: row.notes,
    created_at: row.created_at,
  }));
}

export async function getPayrollSummary(userId: string, role: AppRole) {
  const now = new Date();
  const records = await getPayrollRecords(userId, role, {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const totalGross = records.reduce((sum, r) => sum + r.gross_pay, 0);
  const totalNet = records.reduce((sum, r) => sum + r.net_pay, 0);
  const processed = records.filter((r) => r.status === "PROCESSED" || r.status === "PAID").length;
  const draft = records.filter((r) => r.status === "DRAFT").length;

  return {
    records,
    totalGross,
    totalNet,
    employeeCount: records.length,
    processedCount: processed,
    draftCount: draft,
  };
}

export async function getPayrollAnalytics(userId: string, role: AppRole) {
  const records = await getPayrollRecords(userId, role);
  const byDepartment: Record<string, { gross: number; net: number; count: number }> = {};

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employee_profiles")
    .select("profile_id, departments(name)");

  const deptMap = new Map<string, string>();
  for (const emp of employees ?? []) {
    const dept = asSingleRelation(emp.departments);
    deptMap.set(emp.profile_id, dept?.name ?? "Unassigned");
  }

  for (const record of records) {
    const dept = deptMap.get(record.employee_id) ?? "Unassigned";
    if (!byDepartment[dept]) {
      byDepartment[dept] = { gross: 0, net: 0, count: 0 };
    }
    byDepartment[dept].gross += record.gross_pay;
    byDepartment[dept].net += record.net_pay;
    byDepartment[dept].count += 1;
  }

  const byStatus = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalRecords: records.length,
    totalGross: records.reduce((s, r) => s + r.gross_pay, 0),
    totalNet: records.reduce((s, r) => s + r.net_pay, 0),
    byDepartment: Object.entries(byDepartment).map(([name, stats]) => ({
      name,
      ...stats,
    })),
    byStatus: Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
    })),
  };
}

export async function getEmployeePayroll(
  employeeId: string,
  viewerRole: AppRole,
  viewerId: string,
) {
  if (
    (viewerRole === "EMPLOYEE" || viewerRole === "INTERN") &&
    viewerId !== employeeId
  ) {
    return [];
  }

  return getPayrollRecords(viewerId, viewerRole, { employeeId });
}
