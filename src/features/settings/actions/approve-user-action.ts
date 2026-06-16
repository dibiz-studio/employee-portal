"use server";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";
import { ROLE_LABELS, type AppRole } from "@/shared/types/roles";

export async function approveUserAction(userId: string, role: AppRole) {
  const profile = await getServerProfile();

  if (!profile || !["SUPER_ADMIN", "HR"].includes(profile.role)) {
    return { error: "You do not have permission to approve users." };
  }

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role, onboarding_status: "COMPLETED" })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: userId,
    type: "SYSTEM",
    title: "Account approved",
    message: `Your account has been approved as ${ROLE_LABELS[role]}. You can now access the portal.`,
    link: "/dashboard",
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/hr");
  revalidatePath("/settings/roles");

  if (notificationError) {
    return {
      success: true,
      warning: notificationError.message,
    };
  }

  return { success: true };
}
