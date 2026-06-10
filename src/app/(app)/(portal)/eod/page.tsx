import Link from "next/link";
import { CheckCircle2, ClipboardList, Users } from "lucide-react";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getEodDashboard } from "@/features/eod/services/eod.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { hasPermission } from "@/shared/lib/rbac";
import { formatDate } from "@/shared/lib/utils";

const EOD_NAV = [
  { label: "Overview", href: "/eod" },
  { label: "Submit", href: "/eod/submit" },
  { label: "History", href: "/eod/history" },
];

export default async function EodDashboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const dashboard = await getEodDashboard(profile.id, profile.role);
  const canReview = hasPermission(profile.role, "eod:review:team");

  const nav = [
    ...EOD_NAV,
    ...(canReview ? [{ label: "Review", href: "/eod/review" }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="End of Day"
        description="Submit daily updates and track team progress."
        actions={
          <Button asChild>
            <Link href="/eod/submit">Submit Today&apos;s EOD</Link>
          </Button>
        }
      />
      <SectionNav items={nav} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Status"
          value={dashboard.submittedToday ? "Submitted" : "Pending"}
          icon={CheckCircle2}
        />
        <StatCard
          title="Recent Updates"
          value={dashboard.recentUpdates.length}
          icon={ClipboardList}
        />
        {canReview ? (
          <StatCard
            title="Pending Review"
            value={dashboard.teamPendingReview}
            icon={Users}
            description="Team submissions awaiting review"
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.recentUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No EOD submissions yet.</p>
          ) : (
            <ul className="space-y-3">
              {dashboard.recentUpdates.map((update) => (
                <li
                  key={update.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatDate(update.report_date)}</p>
                    <p className="text-muted-foreground">
                      {update.tasks_completed.length} tasks · {update.hours_worked}h
                    </p>
                  </div>
                  {update.reviewed_at ? (
                    <span className="text-xs text-success">Reviewed</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
