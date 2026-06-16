import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { NotificationsList } from "@/features/notifications/components/notifications-list";
import { getNotifications } from "@/features/notifications/services/notifications.service";
import { PageHeader } from "@/shared/components/data/page-header";

export default async function NotificationsPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const notifications = await getNotifications(profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Your alerts, approvals, and system messages."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
