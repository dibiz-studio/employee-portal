import { createClient } from "@/shared/lib/supabase/server";
import { asSingleRelation } from "@/shared/lib/utils";
import type { AppRole } from "@/shared/types/roles";

export interface DailyUpdateRow {
  id: string;
  employee_id: string;
  employee_name: string;
  report_date: string;
  tasks_completed: string[];
  hours_worked: number;
  blockers: string | null;
  tomorrow_plan: string | null;
  manager_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type TeamMemberRow = {
  employee_id: string;
};

type DailyUpdateQueryRow = {
  id: string;
  employee_id: string;
  report_date: string;
  tasks_completed: string[] | null;
  hours_worked: number | string;
  blockers: string | null;
  tomorrow_plan: string | null;
  manager_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
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

function mapDailyUpdate(row: Record<string, unknown>): DailyUpdateRow {
  return {
    id: row.id as string,
    employee_id: row.employee_id as string,
    employee_name:
      asSingleRelation(
        row.profiles as { full_name: string } | { full_name: string }[] | null,
      )?.full_name ?? "Unknown",
    report_date: row.report_date as string,
    tasks_completed: (row.tasks_completed as string[]) ?? [],
    hours_worked: Number(row.hours_worked),
    blockers: row.blockers as string | null,
    tomorrow_plan: row.tomorrow_plan as string | null,
    manager_comment: row.manager_comment as string | null,
    reviewed_by: row.reviewed_by as string | null,
    reviewed_at: row.reviewed_at as string | null,
    created_at: row.created_at as string,
  };
}

export async function getEodDashboard(userId: string, role: AppRole) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: todayUpdate } = await supabase
    .from("daily_updates")
    .select("id")
    .eq("employee_id", userId)
    .eq("report_date", today)
    .maybeSingle();

  const recent = await getEodHistory(userId, role, { limit: 5 });

  let teamPendingReview = 0;
  if (role === "MANAGER" || role === "HR" || role === "SUPER_ADMIN") {
    const teamUpdates = await getTeamEodForReview(userId, role);
    teamPendingReview = teamUpdates.filter((u) => !u.reviewed_at).length;
  }

  return {
    submittedToday: !!todayUpdate,
    recentUpdates: recent,
    teamPendingReview,
    streak: recent.length,
  };
}

export async function getEodHistory(
  userId: string,
  role: AppRole,
  options?: { employeeId?: string; limit?: number },
): Promise<DailyUpdateRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("daily_updates")
    .select(
      "id, employee_id, report_date, tasks_completed, hours_worked, blockers, tomorrow_plan, manager_comment, reviewed_by, reviewed_at, created_at, profiles!daily_updates_employee_id_fkey(full_name)",
    )
    .order("report_date", { ascending: false });

  if (options?.employeeId) {
    query = query.eq("employee_id", options.employeeId);
  } else if (role === "EMPLOYEE" || role === "INTERN") {
    query = query.eq("employee_id", userId);
  } else if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    teamIds.push(userId);
    query = query.in("employee_id", teamIds);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: DailyUpdateQueryRow) => mapDailyUpdate(row));
}

export async function getTeamEodForReview(
  userId: string,
  role: AppRole,
  options?: { date?: string },
): Promise<DailyUpdateRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("daily_updates")
    .select(
      "id, employee_id, report_date, tasks_completed, hours_worked, blockers, tomorrow_plan, manager_comment, reviewed_by, reviewed_at, created_at, profiles!daily_updates_employee_id_fkey(full_name)",
    )
    .order("report_date", { ascending: false });

  if (role === "MANAGER") {
    const teamIds = await getTeamMemberIds(userId);
    if (teamIds.length === 0) return [];
    query = query.in("employee_id", teamIds);
  }

  if (options?.date) {
    query = query.eq("report_date", options.date);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;

  return (data ?? []).map((row: DailyUpdateQueryRow) => mapDailyUpdate(row));
}

export async function getEmployeeEodHistory(
  employeeId: string,
  options?: { limit?: number },
) {
  return getEodHistory(employeeId, "EMPLOYEE", {
    employeeId,
    limit: options?.limit,
  });
}

export async function getEodByDate(employeeId: string, date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_updates")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("report_date", date)
    .maybeSingle();

  return data;
}
