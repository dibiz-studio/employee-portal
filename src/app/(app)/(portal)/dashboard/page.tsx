import { redirect } from "next/navigation";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { ROLE_DASHBOARD_PATHS } from "@/shared/lib/rbac";

export default async function DashboardPage() {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(ROLE_DASHBOARD_PATHS[profile.role]);
}
