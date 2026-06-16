"use server";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";

export async function markNotificationReadAction(notificationId: string) {
  const profile = await getServerProfile();
  if (!profile) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", profile.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const profile = await getServerProfile();
  if (!profile) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}
