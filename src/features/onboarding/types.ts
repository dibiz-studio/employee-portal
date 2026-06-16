export interface OnboardingInvite {
  id: string;
  invite_token_hint: string | null;
  invitee_email: string;
  invitee_full_name: string | null;
  target_role: string;
  assigned_manager_id: string | null;
  estimated_stipend: number | null;
  joining_letter_file_path: string | null;
  joining_letter_signed_file_path: string | null;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OnboardingIntake {
  id: string;
  invite_id: string;
  profile_id: string;
  current_step: number;
  status: string;
  full_pan: string | null;
  full_aadhaar: string | null;
  pan_drive_url: string | null;
  aadhaar_drive_url: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> & { signed_joining_letter_drive_url?: string | null };
  created_at: string;
  updated_at: string;
}

export interface OnboardingDraft {
  current_step: number;
  full_pan: string | null;
  full_aadhaar: string | null;
  pan_drive_url: string | null;
  aadhaar_drive_url: string | null;
  signed_joining_letter_drive_url?: string | null;
  metadata?: Record<string, unknown>;
}
