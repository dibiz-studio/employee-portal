import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getLeaveNavItems } from "@/features/leave/lib/leave-nav";
import { getLeaveCalendarEvents } from "@/features/leave/services/leave.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/utils";

export default async function LeaveCalendarPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const events = await getLeaveCalendarEvents(profile.id, profile.role);
  const nav = getLeaveNavItems(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Calendar"
        description="Upcoming and pending leave across your team."
      />
      <SectionNav items={nav} />

      {events.length === 0 ? (
        <EmptyState
          title="No scheduled leave"
          description="Approved and pending leave will appear on the calendar."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{event.employee_name}</CardTitle>
                  <StatusBadge status={event.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{event.policy_name}</p>
                <p className="text-muted-foreground">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </p>
                <p className="text-muted-foreground">
                  {event.days_requested} day(s)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
