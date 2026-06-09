import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { getProfile } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { AppRole } from "@/shared/types/roles";
import { ROLE_LABELS } from "@/shared/types/roles";

export default async function ProfileSettingsPage() {
  const session = await getServerProfile();
  if (!session) return null;

  const profile = await getProfile(session.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Update your personal information."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {profile.email} · {ROLE_LABELS[profile.role as AppRole]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userId={profile.id}
            defaultValues={{
              full_name: profile.full_name,
              phone: profile.phone ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
