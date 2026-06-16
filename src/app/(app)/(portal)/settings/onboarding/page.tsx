import Link from "next/link";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getProfilesForRoleManagement } from "@/features/settings/services/settings.service";
import { OnboardingInviteForm } from "@/features/onboarding/components/onboarding-invite-form";
import { PageHeader } from "@/shared/components/data/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { AppRole } from "@/shared/types/roles";

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
};

export default async function OnboardingSettingsPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const users = (await getProfilesForRoleManagement()) as UserProfile[];
  const managers = users.filter((user) =>
    ["SUPER_ADMIN", "HR", "MANAGER"].includes(user.role),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Create secure 24-hour invite links for new joiners."
        backHref="/settings"
        backLabel="Back to Settings"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings/roles">Open Role Management</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <OnboardingInviteForm managers={managers} />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Mail className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-lg">How onboarding works</CardTitle>
              <CardDescription>
                Send a tokenized invite and hand off the rest to the employee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <p>Create a secure invite link that expires in 24 hours.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <p>Link the invite to a manager and stipend before sending.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <p>The joiner opens the invite directly and completes KYC.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need role approvals?</CardTitle>
              <CardDescription>
                Review pending users and assign access in the roles screen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/settings/roles">Go to Role Management</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
