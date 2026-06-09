import { redirect } from "next/navigation";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

import type {
  DepartmentWithStats,
  EmployeeProfile,
  LeaveRequestSummary,
} from "../types";

const EMPLOYEE_SELECT = `
  id,
  profile_id,
  employee_code,
  department_id,
  job_title,
  employment_status,
  hire_date,
  termination_date,
  date_of_birth,
  work_location,
  created_at,
  updated_at,
  profile:profiles!employee_profiles_profile_id_fkey (
    id,
    full_name,
    email,
    avatar_url,
    role,
    phone,
    is_active
  ),
  department:departments (
    id,
    name,
    code
  )
`;

async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manager_assignments")
    .select("employee_id")
    .eq("manager_id", managerId)
    .eq("is_active", true);

  return data?.map((row) => row.employee_id) ?? [];
}

export async function canAccessEmployee(
  viewerId: string,
  viewerRole: AppRole,
  targetProfileId: string,
): Promise<boolean> {
  if (viewerRole === "SUPER_ADMIN" || viewerRole === "HR") return true;
  if (viewerId === targetProfileId) return true;
  if (viewerRole === "MANAGER") {
    const teamIds = await getTeamMemberIds(viewerId);
    return teamIds.includes(targetProfileId);
  }
  return false;
}

export async function requireEmployeeAccess(targetProfileId: string) {
  const profile = await getServerProfile();
  if (!profile) redirect("/login");

  const allowed = await canAccessEmployee(
    profile.id,
    profile.role,
    targetProfileId,
  );
  if (!allowed) redirect("/access-denied");

  return profile;
}

export async function getEmployees(
  role: AppRole,
  userId: string,
): Promise<EmployeeProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("employee_profiles")
    .select(EMPLOYEE_SELECT)
    .order("created_at", { ascending: false });

  if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    if (teamIds.length === 0) return [];
    query = query.in("profile_id", teamIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as unknown as EmployeeProfile[];
}

export async function getEmployeeByProfileId(
  profileId: string,
): Promise<EmployeeProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employee_profiles")
    .select(EMPLOYEE_SELECT)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as EmployeeProfile) ?? null;
}

export async function getEmployeeStats(role: AppRole, userId: string) {
  const employees = await getEmployees(role, userId);
  const active = employees.filter(
    (e) => e.employment_status === "ACTIVE" && e.profile.is_active,
  ).length;
  const onLeave = employees.filter(
    (e) => e.employment_status === "ON_LEAVE",
  ).length;
  const departments = new Set(
    employees.map((e) => e.department?.id).filter(Boolean),
  ).size;

  return {
    total: employees.length,
    active,
    onLeave,
    departments,
  };
}

export async function getDepartmentsWithStats(): Promise<DepartmentWithStats[]> {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select(
      `
      id,
      name,
      code,
      description,
      is_active,
      head:profiles!departments_head_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  const { data: employeeCounts, error: countError } = await supabase
    .from("employee_profiles")
    .select("department_id");

  if (countError) throw countError;

  const countMap = new Map<string, number>();
  for (const row of employeeCounts ?? []) {
    if (row.department_id) {
      countMap.set(
        row.department_id,
        (countMap.get(row.department_id) ?? 0) + 1,
      );
    }
  }

  return (departments ?? []).map((dept) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    is_active: dept.is_active,
    head: Array.isArray(dept.head) ? dept.head[0] ?? null : dept.head,
    employee_count: countMap.get(dept.id) ?? 0,
  })) as DepartmentWithStats[];
}

export async function getEmployeeLeaveRequests(
  profileId: string,
): Promise<LeaveRequestSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      `
      id,
      start_date,
      end_date,
      days_requested,
      reason,
      status,
      policy:leave_policies (name, code)
    `,
    )
    .eq("employee_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    policy: Array.isArray(row.policy) ? row.policy[0] ?? null : row.policy,
  })) as LeaveRequestSummary[];
}

export async function getDepartmentsList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data ?? [];
}
