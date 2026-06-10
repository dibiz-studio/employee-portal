import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { RolesTable } from "@/features/settings/components/roles-table";
import { getProfilesForRoleManagement } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";

// Shape of user profile returned by getProfilesForRoleManagement
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  onboarding_status: string;
  created_at: string;
};

export default async function RolesSettingsPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const users = await getProfilesForRoleManagement();

  const pendingCount = users.filter(
    (u: UserProfile) => u.onboarding_status === "PENDING",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        description={
          pendingCount > 0
            ? `${pendingCount} user(s) awaiting approval. Assign a role to approve and grant dashboard access.`
            : "Assign roles to users across the organization."
        }
      />
      <RolesTable users={users} />
    </div>
  );
}
