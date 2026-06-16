"use server";

import { randomBytes, createHash } from "crypto";

import { revalidatePath } from "next/cache";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { createClient } from "@/shared/lib/supabase/server";
import type { AppRole } from "@/shared/types/roles";

interface CreateOnboardingInviteInput {
  invitee_email: string;
  invitee_full_name: string;
  target_role: Exclude<AppRole, "SUPER_ADMIN">;
  assigned_manager_id?: string | null;
  estimated_stipend?: number | null;
  joining_letter_drive_url?: string | null;
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function generateInviteToken() {
  return randomBytes(24).toString("hex");
}

export async function createOnboardingInviteAction(
  input: CreateOnboardingInviteInput,
) {
  const profile = await getServerProfile();
  if (!profile || !["SUPER_ADMIN", "HR"].includes(profile.role)) {
    return { error: "You do not have permission to create invites." };
  }

  const inviteToken = generateInviteToken();
  const tokenHash = hashInviteToken(inviteToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const supabase = await createClient();
  let managerName: string | null = null;

  if (input.assigned_manager_id) {
    const { data: manager } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", input.assigned_manager_id)
      .maybeSingle();
    managerName = manager?.full_name ?? null;
  }

  const { error } = await supabase.from("onboarding_invites").insert({
    invite_token_hash: tokenHash,
    invite_token_hint: `${input.invitee_email.split("@")[0]}-${inviteToken.slice(0, 6)}`,
    invitee_email: input.invitee_email,
    invitee_full_name: input.invitee_full_name,
    target_role: input.target_role,
    created_by: profile.id,
    assigned_manager_id: input.assigned_manager_id ?? null,
    estimated_stipend: input.estimated_stipend ?? null,
    joining_letter_file_path: input.joining_letter_drive_url ?? null,
    joining_letter_signed_file_path: null,
    joining_letter_sent_at: null,
    joining_letter_returned_at: null,
    expires_at: expiresAt,
    metadata: {
      created_via: "settings/roles",
      manager_name: managerName,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/roles");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/hr");

  return {
    success: true,
    token: inviteToken,
    inviteUrl: `/onboarding/${inviteToken}`,
    expiresAt,
  };
}
