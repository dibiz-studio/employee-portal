"use server";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import {
  createAdminClient,
  hasAdminClient,
} from "@/shared/lib/supabase/admin";
import type { AppRole } from "@/shared/types/roles";

export interface CreateEmployeeInput {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
  phone?: string;
  employee_code: string;
  department_id?: string;
  job_title: string;
  hire_date: string;
  work_location?: string;
  employment_status: "ACTIVE" | "PROBATION";
}

export async function createEmployee(input: CreateEmployeeInput) {
  const profile = await getServerProfile();
  if (!profile || !["SUPER_ADMIN", "HR"].includes(profile.role)) {
    return { error: "You do not have permission to create employees." };
  }

  if (!hasAdminClient()) {
    return {
      error:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local from Supabase → Settings → API, then restart the dev server.",
    };
  }

  const admin = createAdminClient();
  const userMetadata = {
    full_name: input.full_name,
    role: input.role,
    onboarding_status: "COMPLETED",
  };

  const { data: authData, error: authError } = await admin.auth.admin.createUser(
    {
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: userMetadata,
    },
  );

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Failed to create user account." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: input.full_name,
      role: input.role,
      phone: input.phone || null,
      onboarding_status: "COMPLETED",
      is_active: true,
    })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: empError } = await admin.from("employee_profiles").insert({
    profile_id: userId,
    employee_code: input.employee_code,
    department_id: input.department_id || null,
    job_title: input.job_title,
    hire_date: input.hire_date,
    work_location: input.work_location || null,
    employment_status: input.employment_status,
  });

  if (empError) {
    return { error: empError.message };
  }

  revalidatePath("/employees");
  return { success: true, profileId: userId };
}
