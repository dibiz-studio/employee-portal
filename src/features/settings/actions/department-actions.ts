"use server";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
}

export async function createDepartment(input: CreateDepartmentInput) {
  const profile = await getServerProfile();
  if (!profile || !["SUPER_ADMIN", "HR"].includes(profile.role)) {
    return { error: "You do not have permission to create departments." };
  }

  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();

  if (!name || name.length < 2) {
    return { error: "Department name must be at least 2 characters." };
  }

  if (!code || code.length < 2) {
    return { error: "Department code must be at least 2 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert({
      name,
      code,
      description: input.description?.trim() || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A department with this name or code already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/settings/departments");
  revalidatePath("/employees/departments");
  revalidatePath("/employees/new");

  return { success: true, id: data.id };
}
