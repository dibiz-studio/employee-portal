import { NextResponse } from "next/server";

import { createClient } from "@/shared/lib/supabase/server";
import { ROLE_DASHBOARD_PATHS } from "@/shared/lib/rbac";
import type { AppRole } from "@/shared/types/roles";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const metadata = user.user_metadata ?? {};
  const avatarUrl =
    (metadata.avatar_url as string | undefined) ??
    (metadata.picture as string | undefined) ??
    null;
  const fullName =
    (metadata.full_name as string | undefined) ??
    (metadata.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, onboarding_status, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl, full_name: fullName })
      .eq("id", user.id);
  } else {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: "EMPLOYEE",
      is_active: true,
      onboarding_status: "PENDING",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_status")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_status !== "COMPLETED") {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  const role = (profile?.role as AppRole | undefined) ?? "EMPLOYEE";
  const destination = ROLE_DASHBOARD_PATHS[role] ?? "/dashboard";

  return NextResponse.redirect(`${origin}${destination}`);
}
