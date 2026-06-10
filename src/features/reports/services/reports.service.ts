import { createClient } from "@/shared/lib/supabase/server";
import { asSingleRelation } from "@/shared/lib/utils";

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  head_name: string | null;
  employee_count: number;
  is_active: boolean;
}

export async function getDepartmentsWithStats(): Promise<DepartmentRow[]> {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select(
      "id, name, code, description, is_active, profiles!departments_head_id_fkey(full_name)",
    )
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  const { data: employees } = await supabase
    .from("employee_profiles")
    .select("department_id");

  const countMap = new Map<string, number>();
  for (const emp of employees ?? []) {
    if (emp.department_id) {
      countMap.set(
        emp.department_id,
        (countMap.get(emp.department_id) ?? 0) + 1,
      );
    }
  }

  return (departments ?? []).map((dept: { id: string; name: string; code: string; description: string | null; is_active: boolean; profiles?: { full_name: string } | { full_name: string }[] | null }) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    head_name: asSingleRelation(dept.profiles)?.full_name ?? null,
    employee_count: countMap.get(dept.id) ?? 0,
    is_active: dept.is_active,
  }));
}

export async function getOrganizationReportData() {
  const supabase = await createClient();
  const now = new Date();

  const [
    { count: employeeCount },
    { count: departmentCount },
    { count: pendingLeaves },
    { count: activeKpis },
    { data: payrollData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("departments")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("leave_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("employee_kpis")
      .select("*", { count: "exact", head: true })
      .in("status", ["IN_PROGRESS", "ON_TRACK", "AT_RISK"]),
    supabase
      .from("payroll_records")
      .select("gross_pay, net_pay, status")
      .eq("period_month", now.getMonth() + 1)
      .eq("period_year", now.getFullYear()),
  ]);

  const totalGross =
    payrollData?.reduce((s: number, r: { gross_pay: number | string }) => s + Number(r.gross_pay), 0) ?? 0;
  const totalNet =
    payrollData?.reduce((s: number, r: { net_pay: number | string }) => s + Number(r.net_pay), 0) ?? 0;

  return {
    employeeCount: employeeCount ?? 0,
    departmentCount: departmentCount ?? 0,
    pendingLeaves: pendingLeaves ?? 0,
    activeKpis: activeKpis ?? 0,
    payrollRecords: payrollData?.length ?? 0,
    totalGrossPay: totalGross,
    totalNetPay: totalNet,
    generatedAt: now.toISOString(),
    period: `${now.toLocaleString("en-IN", { month: "long" })} ${now.getFullYear()}`,
  };
}

export interface DepartmentEmployee {
  name: string;
  email: string;
  job_title: string;
  status: string;
}

export async function getDepartmentReportData(departmentId: string) {
  const supabase = await createClient();

  const { data: department, error: deptError } = await supabase
    .from("departments")
    .select(
      "id, name, code, description, profiles!departments_head_id_fkey(full_name)",
    )
    .eq("id", departmentId)
    .single();

  if (deptError) throw deptError;

  const { data: employees } = await supabase
    .from("employee_profiles")
    .select(
      "id, profile_id, job_title, employment_status, profiles!employee_profiles_profile_id_fkey(full_name, email)",
    )
    .eq("department_id", departmentId);

  const profileIds = (employees ?? []).map((e: { profile_id: string; profiles?: { full_name: string; email: string } | { full_name: string; email: string }[] | null; job_title: string; employment_status: string }) => e.profile_id);

  let leaveCount = 0;
  let kpiCount = 0;
  let eodCount = 0;

  if (profileIds.length > 0) {
    const [leaves, kpis, eods] = await Promise.all([
      supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .in("employee_id", profileIds),
      supabase
        .from("employee_kpis")
        .select("*", { count: "exact", head: true })
        .in("employee_id", profileIds),
      supabase
        .from("daily_updates")
        .select("*", { count: "exact", head: true })
        .in("employee_id", profileIds),
    ]);

    leaveCount = leaves.count ?? 0;
    kpiCount = kpis.count ?? 0;
    eodCount = eods.count ?? 0;
  }
  const employeeList: DepartmentEmployee[] = (employees ?? []).map((e: { profile_id: string; profiles?: { full_name: string; email: string } | { full_name: string; email: string }[] | null; job_title: string; employment_status: string }): DepartmentEmployee => ({
    name: (asSingleRelation(e.profiles)?.full_name as string) || "Unknown",
    email: (asSingleRelation(e.profiles)?.email as string) || "",
    job_title: (e.job_title as string) || "",
    status: (e.employment_status as string) || "ACTIVE",
  }));

  return {
    department: {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      head_name: asSingleRelation(department.profiles)?.full_name ?? null,
    },
    employeeCount: employees?.length ?? 0,
    employees: employeeList,
    leaveRequests: leaveCount,
    activeKpis: kpiCount,
    eodSubmissions: eodCount,
    generatedAt: new Date().toISOString(),
  };
}
