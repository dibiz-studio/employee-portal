"use server";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

import type { KpiPeriod } from "../types";

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: string;
  measurement_unit: string;
  default_target?: number;
  period: KpiPeriod;
  department_id?: string;
  weight: number;
}

export async function createKpiTemplate(input: CreateTemplateInput) {
  const profile = await getServerProfile();
  if (!profile || !["SUPER_ADMIN", "HR"].includes(profile.role)) {
    return { error: "You do not have permission to manage templates." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("kpi_templates").insert({
    name: input.name,
    description: input.description || null,
    category: input.category,
    measurement_unit: input.measurement_unit,
    default_target: input.default_target ?? null,
    period: input.period,
    department_id: input.department_id || null,
    weight: input.weight,
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/kpi/templates");
  return { success: true };
}

export interface AssignKpiInput {
  employee_id: string;
  template_id?: string;
  title: string;
  description?: string;
  target_value: number;
  unit: string;
  weight: number;
  period: KpiPeriod;
  period_start: string;
  period_end: string;
}

export async function assignKpi(input: AssignKpiInput) {
  const profile = await getServerProfile();
  if (
    !profile ||
    !(["SUPER_ADMIN", "HR", "MANAGER"] as AppRole[]).includes(profile.role)
  ) {
    return { error: "You do not have permission to assign KPIs." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("employee_kpis").insert({
    employee_id: input.employee_id,
    template_id: input.template_id || null,
    title: input.title,
    description: input.description || null,
    target_value: input.target_value,
    unit: input.unit,
    weight: input.weight,
    period: input.period,
    period_start: input.period_start,
    period_end: input.period_end,
    assigned_by: profile.id,
    status: "NOT_STARTED",
    current_value: 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/kpi");
  revalidatePath(`/employees/${input.employee_id}`);
  return { success: true };
}
