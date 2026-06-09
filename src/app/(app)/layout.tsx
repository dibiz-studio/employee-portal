import { redirect } from "next/navigation";

import { InitialStateProvider } from "@/features/auth/components/initial-state-provider";
import { getServerProfile } from "@/features/auth/services/auth-server.service";

export const metadata = {
  title: "Dibiz Studio – Employee Management Portal",
  description: "Employee management for Dibiz Studio.",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getServerProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <InitialStateProvider profile={profile}>{children}</InitialStateProvider>
  );
}
