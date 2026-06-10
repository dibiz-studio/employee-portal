import { redirect } from "next/navigation";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

export interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  activeKpis: number;
  kpiAtRisk: number;
  unreadNotifications: number;
  departments: number;
  pendingOnboarding: number;
}

async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("manager_assignments")
    .select("employee_id")
    .eq("manager_id", managerId)
    .eq("is_active", true);

  type ManagerAssignmentRow = { employee_id: string };
  return data?.map((row: ManagerAssignmentRow) => row.employee_id) ?? [];
}

export async function getDashboardStats(
  userId: string,
  role: AppRole,
): Promise<DashboardStats> {
  const supabase = await createClient();

  let employeeFilter: string[] | null = null;

  if (role === "MANAGER") {
    employeeFilter = await getTeamMemberIds(userId);
  } else if (role === "EMPLOYEE" || role === "INTERN") {
    employeeFilter = [userId];
  }

  const profilesQuery = supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const leaveQuery = supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  const activeKpisQuery = supabase
    .from("employee_kpis")
    .select("*", { count: "exact", head: true })
    .in("status", ["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK"]);

  const atRiskKpisQuery = supabase
    .from("employee_kpis")
    .select("*", { count: "exact", head: true })
    .eq("status", "AT_RISK");

  const notificationsQuery = supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  const departmentsQuery = supabase
    .from("departments")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const pendingOnboardingQuery = supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_status", "PENDING")
    .eq("is_active", true);

  if (employeeFilter) {
    if (employeeFilter.length === 0) {
      return {
        totalEmployees: 0,
        pendingLeaves: 0,
        activeKpis: 0,
        kpiAtRisk: 0,
        unreadNotifications: 0,
        departments: 0,
        pendingOnboarding: 0,
      };
    }

    profilesQuery.in("id", employeeFilter);
    leaveQuery.in("employee_id", employeeFilter);
    activeKpisQuery.in("employee_id", employeeFilter);
    atRiskKpisQuery.in("employee_id", employeeFilter);
  }

  const isOrgAdmin = role === "SUPER_ADMIN" || role === "HR";

  const [
    profilesResult,
    leavesResult,
    activeKpisResult,
    atRiskKpisResult,
    notificationsResult,
    departmentsResult,
    pendingOnboardingResult,
  ] = await Promise.all([
    profilesQuery,
    leaveQuery,
    activeKpisQuery,
    atRiskKpisQuery,
    notificationsQuery,
    isOrgAdmin ? departmentsQuery : Promise.resolve({ count: 0 }),
    isOrgAdmin
      ? pendingOnboardingQuery
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    totalEmployees: profilesResult.count ?? 0,
    pendingLeaves: leavesResult.count ?? 0,
    activeKpis: activeKpisResult.count ?? 0,
    kpiAtRisk: atRiskKpisResult.count ?? 0,
    unreadNotifications: notificationsResult.count ?? 0,
    departments: departmentsResult.count ?? 0,
    pendingOnboarding: pendingOnboardingResult.count ?? 0,
  };
}

export async function requireRole(allowed: AppRole[]) {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!allowed.includes(profile.role)) {
    redirect("/access-denied");
  }

  return profile;
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}
