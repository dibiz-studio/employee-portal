import { createClient } from "@/shared/lib/supabase/client";

import type {
  OnboardingDraft,
  OnboardingIntake,
  OnboardingInvite,
} from "../types";

export async function fetchInvite(token: string) {
  const response = await fetch(
    `/api/onboarding/invite?token=${encodeURIComponent(token)}`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? "Unable to load invite");
  }

  return (await response.json()) as {
    invite: OnboardingInvite;
    status: "active" | "expired" | "revoked" | "used";
  };
}

export async function fetchOnboardingIntake(
  profileId: string,
  inviteId: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_intakes")
    .select("*")
    .eq("profile_id", profileId)
    .eq("invite_id", inviteId)
    .maybeSingle();

  if (error) throw error;
  return data as OnboardingIntake | null;
}

export async function saveOnboardingDraft(params: {
  profileId: string;
  inviteId: string;
  draft: OnboardingDraft;
  status?: "DRAFT" | "SUBMITTED";
}) {
  const supabase = createClient();
  const submittedAt =
    params.status === "SUBMITTED" ? new Date().toISOString() : null;
  const payload = {
    id: `${params.profileId}:${params.inviteId}`,
    invite_id: params.inviteId,
    profile_id: params.profileId,
    current_step: params.draft.current_step,
    status: params.status ?? "DRAFT",
    full_pan: params.draft.full_pan,
    full_aadhaar: params.draft.full_aadhaar,
    pan_drive_url: params.draft.pan_drive_url,
    aadhaar_drive_url: params.draft.aadhaar_drive_url,
    submitted_at: submittedAt,
    metadata: {
      ...(params.draft.metadata ?? {}),
      signed_joining_letter_drive_url: params.draft.signed_joining_letter_drive_url,
    },
  };

  const { data, error } = await supabase
    .from("onboarding_intakes")
    .upsert(payload)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as OnboardingIntake | null;
}

export async function submitOnboardingIntake(params: {
  profileId: string;
  inviteId: string;
  draft: OnboardingDraft;
}) {
  return saveOnboardingDraft({
    profileId: params.profileId,
    inviteId: params.inviteId,
    draft: params.draft,
    status: "SUBMITTED",
  });
}

export async function fetchCurrentProfileInvite(profileId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_invite_id, onboarding_status")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data as { onboarding_invite_id: string | null; onboarding_status: string } | null;
}
