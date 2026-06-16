import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/shared/lib/supabase/admin";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const tokenHash = hashInviteToken(token);
  const { data, error } = await supabase
    .from("onboarding_invites")
    .select("*")
    .eq("invite_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const invite = data as {
    expires_at: string;
    revoked_at: string | null;
    used_at: string | null;
  };

  const now = new Date();
  const expiresAt = new Date(invite.expires_at);
  const status = invite.revoked_at
    ? "revoked"
    : invite.used_at
      ? "used"
      : expiresAt < now
        ? "expired"
        : "active";

  return NextResponse.json({
    status,
    invite: data,
  });
}
