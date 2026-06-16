import type { AppRole } from "@/shared/types/roles";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { getProfile } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { formatDateTime } from "@/shared/lib/utils";
import { ROLE_LABELS } from "@/shared/types/roles";
import Link from "next/link";

export default async function ProfileSettingsPage() {
  const session = await getServerProfile();
  if (!session) return null;

  const profile = await getProfile(session.id);
  const canManageBrands = profile.role === "SUPER_ADMIN" || profile.role === "HR";
  const nav = getEodNavItems(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Update your personal information and see your current access details."
        actions={
          <Button asChild variant="outline">
            <Link href="/eod/submit">Go to EOD</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Account snapshot</CardTitle>
            <CardDescription>
              Your login, role, and profile status at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{ROLE_LABELS[profile.role as AppRole]}</Badge>
              <Badge variant={profile.is_active ? "success" : "destructive"}>
                {profile.is_active ? "Active" : "Inactive"}
              </Badge>
              {profile.onboarding_status ? (
                <Badge variant={profile.onboarding_status === "COMPLETED" ? "success" : "warning"}>
                  Onboarding {profile.onboarding_status.toLowerCase()}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{profile.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-1 font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="mt-1 font-medium">{profile.phone ?? "Not set"}</p>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Member since</p>
                  <p className="mt-1 font-medium">{formatDateTime(profile.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated</p>
                  <p className="mt-1 font-medium">{formatDateTime(profile.updated_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
            <div className="w-full rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              {canManageBrands ? (
                <p>
                  Brand setup lives in EOD. If you have no brands yet, create one at{" "}
                  <Link href="/eod/brands/new" className="font-medium text-orange-300 underline-offset-4 hover:underline">
                    /eod/brands/new
                  </Link>
                  .
                </p>
              ) : (
                <p>
                  Brands are managed by HR/Admin. If EOD has no brand options, ask them to add one in the Brands section.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {nav.find((item) => item.href === "/eod/brands") ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/eod/brands">View brands</Link>
                </Button>
              ) : null}
              {canManageBrands ? (
                <Button asChild size="sm">
                  <Link href="/eod/brands/new">Add brand</Link>
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Keep your name and contact details current.</CardDescription>
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
    </div>
  );
}
