import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select(
      "id, name, code, description, is_active, profiles!departments_head_id_fkey(full_name)",
    )
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProfilesForRoleManagement() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active, onboarding_status, created_at")
    .order("onboarding_status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPendingOnboardingUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("onboarding_status", "PENDING")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCompanyStats() {
  const supabase = await createClient();
  const [
    { count: employees },
    { count: departments },
    { count: policies },
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
      .from("leave_policies")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  return {
    employees: employees ?? 0,
    departments: departments ?? 0,
    leavePolicies: policies ?? 0,
  };
}

export async function getLeaveSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_policies")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getKpiSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kpi_templates")
    .select("id, name, category, period, is_active, weight, default_target")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getPayrollSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_records")
    .select("allowances, deductions")
    .limit(10);

  if (error) throw error;

  const allowanceKeys = new Set<string>();
  const deductionKeys = new Set<string>();

  for (const record of data ?? []) {
    Object.keys((record.allowances as Record<string, number>) ?? {}).forEach(
      (k) => allowanceKeys.add(k),
    );
    Object.keys((record.deductions as Record<string, number>) ?? {}).forEach(
      (k) => deductionKeys.add(k),
    );
  }

  return {
    allowanceTypes: Array.from(allowanceKeys),
    deductionTypes: Array.from(deductionKeys),
    sampleCount: data?.length ?? 0,
  };
}

export async function updateProfileRole(userId: string, role: AppRole) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
}
