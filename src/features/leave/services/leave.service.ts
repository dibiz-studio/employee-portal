import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

export interface LeaveBalance {
  id: string;
  policy_id: string;
  policy_name: string;
  policy_code: string;
  allocated_days: number;
  used_days: number;
  remaining_days: number;
  year: number;
}

export interface LeaveRequestRow {
  id: string;
  employee_id: string;
  employee_name: string;
  policy_id: string;
  policy_name: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export interface LeavePolicyRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  min_notice_days: number;
  max_consecutive_days: number | null;
  carry_forward: boolean;
  carry_forward_limit: number | null;
  is_active: boolean;
}

import { asSingleRelation } from "@/shared/lib/utils";

async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manager_assignments")
    .select("employee_id")
    .eq("manager_id", managerId)
    .eq("is_active", true);

  return data?.map((row) => row.employee_id) ?? [];
}

export async function getLeaveBalances(
  employeeId: string,
  year?: number,
): Promise<LeaveBalance[]> {
  const supabase = await createClient();
  const currentYear = year ?? new Date().getFullYear();

  const { data, error } = await supabase
    .from("employee_leave_policy")
    .select(
      "id, policy_id, allocated_days, used_days, year, leave_policies(name, code)",
    )
    .eq("employee_id", employeeId)
    .eq("year", currentYear);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const policy = asSingleRelation(row.leave_policies);
    const allocated = Number(row.allocated_days);
    const used = Number(row.used_days);

    return {
      id: row.id,
      policy_id: row.policy_id,
      policy_name: policy?.name ?? "Unknown",
      policy_code: policy?.code ?? "",
      allocated_days: allocated,
      used_days: used,
      remaining_days: allocated - used,
      year: row.year,
    };
  });
}

export async function getLeaveRequests(
  userId: string,
  role: AppRole,
  options?: { employeeId?: string; status?: string; limit?: number },
): Promise<LeaveRequestRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("leave_requests")
    .select(
      "id, employee_id, policy_id, start_date, end_date, days_requested, reason, status, reviewed_by, reviewed_at, review_notes, created_at, profiles!leave_requests_employee_id_fkey(full_name), leave_policies(name)",
    )
    .order("created_at", { ascending: false });

  if (options?.employeeId) {
    query = query.eq("employee_id", options.employeeId);
  } else if (role === "EMPLOYEE" || role === "INTERN") {
    query = query.eq("employee_id", userId);
  } else if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    if (teamIds.length === 0) return [];
    query = query.in("employee_id", teamIds);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    employee_name: asSingleRelation(row.profiles)?.full_name ?? "Unknown",
    policy_id: row.policy_id,
    policy_name: asSingleRelation(row.leave_policies)?.name ?? "Unknown",
    start_date: row.start_date,
    end_date: row.end_date,
    days_requested: Number(row.days_requested),
    reason: row.reason,
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    review_notes: row.review_notes,
    created_at: row.created_at,
  }));
}

export async function getPendingLeaveApprovals(
  userId: string,
  role: AppRole,
): Promise<LeaveRequestRow[]> {
  if (role === "EMPLOYEE" || role === "INTERN") return [];

  const requests = await getLeaveRequests(userId, role, { status: "PENDING" });
  return requests;
}

export async function getLeavePolicies(
  activeOnly = true,
): Promise<LeavePolicyRow[]> {
  const supabase = await createClient();
  let query = supabase.from("leave_policies").select("*").order("name");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    days_per_year: Number(row.days_per_year),
    is_paid: row.is_paid,
    requires_approval: row.requires_approval,
    min_notice_days: row.min_notice_days,
    max_consecutive_days: row.max_consecutive_days,
    carry_forward: row.carry_forward,
    carry_forward_limit: row.carry_forward_limit
      ? Number(row.carry_forward_limit)
      : null,
    is_active: row.is_active,
  }));
}

export async function getLeavePolicy(id: string): Promise<LeavePolicyRow | null> {
  const policies = await getLeavePolicies(false);
  return policies.find((p) => p.id === id) ?? null;
}

export async function getLeaveCalendarEvents(
  userId: string,
  role: AppRole,
): Promise<LeaveRequestRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("leave_requests")
    .select(
      "id, employee_id, policy_id, start_date, end_date, days_requested, reason, status, reviewed_by, reviewed_at, review_notes, created_at, profiles!leave_requests_employee_id_fkey(full_name), leave_policies(name)",
    )
    .in("status", ["APPROVED", "PENDING"])
    .order("start_date", { ascending: true });

  if (role === "EMPLOYEE" || role === "INTERN") {
    query = query.eq("employee_id", userId);
  } else if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    teamIds.push(userId);
    query = query.in("employee_id", teamIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    employee_id: row.employee_id,
    employee_name: asSingleRelation(row.profiles)?.full_name ?? "Unknown",
    policy_id: row.policy_id,
    policy_name: asSingleRelation(row.leave_policies)?.name ?? "Unknown",
    start_date: row.start_date,
    end_date: row.end_date,
    days_requested: Number(row.days_requested),
    reason: row.reason,
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    review_notes: row.review_notes,
    created_at: row.created_at,
  }));
}

export async function getLeaveAnalytics(userId: string, role: AppRole) {
  const requests = await getLeaveRequests(userId, role);
  const byStatus = requests.reduce<Record<string, number>>((acc, req) => {
    acc[req.status] = (acc[req.status] ?? 0) + 1;
    return acc;
  }, {});

  const byPolicy = requests.reduce<Record<string, number>>((acc, req) => {
    acc[req.policy_name] = (acc[req.policy_name] ?? 0) + req.days_requested;
    return acc;
  }, {});

  const totalDays = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.days_requested, 0);

  return {
    totalRequests: requests.length,
    pendingCount: byStatus.PENDING ?? 0,
    approvedCount: byStatus.APPROVED ?? 0,
    rejectedCount: byStatus.REJECTED ?? 0,
    totalApprovedDays: totalDays,
    byPolicy: Object.entries(byPolicy).map(([name, days]) => ({ name, days })),
  };
}

export async function getActiveLeavePoliciesForEmployee(employeeId: string) {
  const balances = await getLeaveBalances(employeeId);
  return balances.map((b) => ({
    policy_id: b.policy_id,
    policy_name: b.policy_name,
    remaining_days: b.remaining_days,
  }));
}
