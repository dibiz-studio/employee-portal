import { createClient } from "@/shared/lib/supabase/server";
import { asSingleRelation } from "@/shared/lib/utils";
import type { AppRole } from "@/shared/types/roles";

import { calcProgress } from "../lib/utils";
import type {
  EmployeeKpi,
  KpiDashboardStats,
  KpiTemplate,
  KpiTrendPoint,
  LeaderboardEntry,
} from "../types";

const KPI_SELECT = `
  id,
  employee_id,
  template_id,
  title,
  description,
  target_value,
  current_value,
  unit,
  weight,
  period,
  period_start,
  period_end,
  status,
  notes,
  created_at,
  employee:profiles!employee_kpis_employee_id_fkey (
    id,
    full_name,
    avatar_url
  ),
  template:kpi_templates (name, category)
`;

type TeamMemberRow = {
  employee_id: string;
};

type EmployeeKpiQueryRow = Omit<EmployeeKpi, "employee" | "template"> & {
  employee:
    | { id: string; full_name: string; avatar_url: string | null }
    | { id: string; full_name: string; avatar_url: string | null }[]
    | null;
  template:
    | { name: string; category: string }
    | { name: string; category: string }[]
    | null;
};

type KpiTemplateQueryRow = KpiTemplate & {
  department:
    | { id: string; name: string; code: string }
    | { id: string; name: string; code: string }[]
    | null;
};

type KpiLeaderboardQueryRow = {
  employee_id: string;
  current_value: number | string;
  target_value: number | string;
  status: string;
  employee:
    | { id: string; full_name: string; avatar_url: string | null }
    | { id: string; full_name: string; avatar_url: string | null }[]
    | null;
};

type EmployeeDepartmentQueryRow = {
  profile_id: string;
  department: { name: string } | { name: string }[] | null;
};

type AssignableEmployeeQueryRow = {
  profile_id: string;
  employee_code: string;
  job_title: string;
  profile:
    | { id: string; full_name: string; email: string }
    | { id: string; full_name: string; email: string }[]
    | null;
};

async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manager_assignments")
    .select("employee_id")
    .eq("manager_id", managerId)
    .eq("is_active", true);

  return data?.map((row: TeamMemberRow) => row.employee_id) ?? [];
}

export async function getEmployeeKpis(
  role: AppRole,
  userId: string,
  employeeId?: string,
): Promise<EmployeeKpi[]> {
  const supabase = await createClient();
  let teamIds: string[] | null = null;

  if (role === "MANAGER") {
    teamIds = await getTeamMemberIds(userId);
  }

  let query = supabase
    .from("employee_kpis")
    .select(KPI_SELECT)
    .order("created_at", { ascending: false });

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  } else if (role === "MANAGER" && teamIds) {
    if (teamIds.length === 0) return [];
    query = query.in("employee_id", teamIds);
  } else if (role === "EMPLOYEE" || role === "INTERN") {
    query = query.eq("employee_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: EmployeeKpiQueryRow) => ({
    ...row,
    employee: asSingleRelation(row.employee),
    template: asSingleRelation(row.template),
  })) as EmployeeKpi[];
}

export async function getKpiById(
  role: AppRole,
  userId: string,
  kpiId: string,
): Promise<EmployeeKpi | null> {
  const kpis = await getEmployeeKpis(role, userId);
  return kpis.find((kpi) => kpi.id === kpiId) ?? null;
}

export async function getKpiDashboardStats(
  role: AppRole,
  userId: string,
): Promise<KpiDashboardStats> {
  const kpis = await getEmployeeKpis(role, userId);
  const active = kpis.filter((k) => !["COMPLETED", "CANCELLED"].includes(k.status));

  const avgCompletion =
    active.length > 0
      ? Math.round(
          active.reduce((sum, k) => sum + calcProgress(k), 0) / active.length,
        )
      : 0;

  return {
    total: kpis.length,
    onTrack: kpis.filter((k) => k.status === "ON_TRACK").length,
    atRisk: kpis.filter((k) => k.status === "AT_RISK").length,
    completed: kpis.filter((k) => k.status === "COMPLETED").length,
    inProgress: kpis.filter((k) =>
      ["IN_PROGRESS", "NOT_STARTED"].includes(k.status),
    ).length,
    avgCompletion,
  };
}

export async function getKpiTemplates(): Promise<KpiTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_templates")
    .select(
      `
      id,
      name,
      description,
      category,
      measurement_unit,
      default_target,
      period,
      department_id,
      weight,
      is_active,
      created_at,
      department:departments (id, name, code)
    `,
    )
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row: KpiTemplateQueryRow) => ({
    ...row,
    department: asSingleRelation(row.department),
  })) as KpiTemplate[];
}

export async function getKpiTrendData(
  role: AppRole,
  userId: string,
): Promise<KpiTrendPoint[]> {
  const kpis = await getEmployeeKpis(role, userId);
  const active = kpis.filter((k) => !["CANCELLED"].includes(k.status));

  const byStatus = new Map<string, { total: number; count: number }>();
  for (const kpi of active) {
    const label = kpi.status.replace(/_/g, " ");
    const entry = byStatus.get(label) ?? { total: 0, count: 0 };
    entry.total += calcProgress(kpi);
    entry.count += 1;
    byStatus.set(label, entry);
  }

  return Array.from(byStatus.entries()).map(([label, { total, count }]) => ({
    label,
    value: count > 0 ? Math.round(total / count) : 0,
    target: 100,
  }));
}

export async function getKpiCategoryBreakdown(
  role: AppRole,
  userId: string,
): Promise<{ category: string; count: number; avgProgress: number }[]> {
  const kpis = await getEmployeeKpis(role, userId);
  const map = new Map<string, { count: number; totalProgress: number }>();

  for (const kpi of kpis) {
    const category = kpi.template?.category ?? "Uncategorized";
    const entry = map.get(category) ?? { count: 0, totalProgress: 0 };
    entry.count += 1;
    entry.totalProgress += calcProgress(kpi);
    map.set(category, entry);
  }

  return Array.from(map.entries())
    .map(([category, { count, totalProgress }]) => ({
      category,
      count,
      avgProgress: count > 0 ? Math.round(totalProgress / count) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getKpiLeaderboard(
  role: AppRole,
  userId: string,
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  let teamIds: string[] | null = null;

  if (role === "MANAGER") {
    teamIds = await getTeamMemberIds(userId);
    if (teamIds.length === 0) return [];
  }

  let kpiQuery = supabase
    .from("employee_kpis")
    .select(
      `
      employee_id,
      current_value,
      target_value,
      status,
      employee:profiles!employee_kpis_employee_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .not("status", "eq", "CANCELLED");

  if (role === "MANAGER" && teamIds) {
    kpiQuery = kpiQuery.in("employee_id", teamIds);
  } else if (role === "EMPLOYEE" || role === "INTERN") {
    kpiQuery = kpiQuery.eq("employee_id", userId);
  }

  const { data: kpiData, error } = await kpiQuery;
  if (error) throw error;

  const { data: empProfiles } = await supabase
    .from("employee_profiles")
    .select(
      `
      profile_id,
      department:departments (name)
    `,
    );

  const deptMap = new Map<string, string>();
  for (const ep of (empProfiles ?? []) as EmployeeDepartmentQueryRow[]) {
    const dept = asSingleRelation(ep.department);
    deptMap.set(ep.profile_id, dept?.name ?? "Unassigned");
  }

  const leaderboard = new Map<
    string,
    {
      fullName: string;
      avatarUrl: string | null;
      totalProgress: number;
      kpiCount: number;
      onTrackCount: number;
    }
  >();

  for (const row of (kpiData ?? []) as KpiLeaderboardQueryRow[]) {
    const employee = asSingleRelation(row.employee);
    if (!employee) continue;

    const entry = leaderboard.get(row.employee_id) ?? {
      fullName: employee.full_name,
      avatarUrl: employee.avatar_url,
      totalProgress: 0,
      kpiCount: 0,
      onTrackCount: 0,
    };
    entry.totalProgress += calcProgress({
      current_value: Number(row.current_value),
      target_value: Number(row.target_value),
    });
    entry.kpiCount += 1;
    if (row.status === "ON_TRACK" || row.status === "COMPLETED") {
      entry.onTrackCount += 1;
    }
    leaderboard.set(row.employee_id, entry);
  }

  return Array.from(leaderboard.entries())
    .map(([employeeId, entry]) => ({
      employeeId,
      fullName: entry.fullName,
      avatarUrl: entry.avatarUrl,
      department: deptMap.get(employeeId) ?? "Unassigned",
      avgProgress:
        entry.kpiCount > 0
          ? Math.round(entry.totalProgress / entry.kpiCount)
          : 0,
      kpiCount: entry.kpiCount,
      onTrackCount: entry.onTrackCount,
    }))
    .sort((a, b) => b.avgProgress - a.avgProgress);
}

export async function getAssignableEmployees(role: AppRole, userId: string) {
  const supabase = await createClient();

  let query = supabase
    .from("employee_profiles")
    .select(
      `
      profile_id,
      employee_code,
      job_title,
      profile:profiles!employee_profiles_profile_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .order("employee_code");

  if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    if (teamIds.length === 0) return [];
    query = query.in("profile_id", teamIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: AssignableEmployeeQueryRow) => ({
    profile_id: row.profile_id,
    employee_code: row.employee_code,
    job_title: row.job_title,
    profile: asSingleRelation(row.profile),
  }));
}
