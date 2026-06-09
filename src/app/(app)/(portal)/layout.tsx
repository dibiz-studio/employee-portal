import { redirect } from "next/navigation";

import { AppShell } from "@/features/app/components/app-shell";
import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getUnreadNotificationCount } from "@/features/dashboard/services/dashboard.service";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.onboarding_status !== "COMPLETED") {
    redirect("/onboarding");
  }

  const notificationCount = await getUnreadNotificationCount(profile.id);

  return (
    <AppShell profile={profile} notificationCount={notificationCount}>
      {children}
    </AppShell>
  );
}
