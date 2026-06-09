import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { PageHeader } from "@/shared/components/data/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const NOTIFICATION_TYPES = [
  { type: "LEAVE", label: "Leave requests and approvals" },
  { type: "KPI", label: "KPI assignments and updates" },
  { type: "PAYROLL", label: "Payroll processing alerts" },
  { type: "EOD", label: "Daily update reminders" },
  { type: "APPROVAL", label: "Pending approval notifications" },
  { type: "SYSTEM", label: "System announcements" },
];

export default async function NotificationSettingsPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        description="Configure which notifications you receive."
      />

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            All notification types are enabled by default. Preferences are
            stored per user in a future release.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {NOTIFICATION_TYPES.map((item) => (
              <li
                key={item.type}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <span className="text-sm text-success">Enabled</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
