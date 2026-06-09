import { redirect } from "next/navigation";

import { getServerProfile } from "@/features/auth/services/auth-server.service";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.onboarding_status === "COMPLETED") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
