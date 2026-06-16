import Link from "next/link";
import { CheckCircle2, ClipboardList, Plus, Users } from "lucide-react";

import { getAllBrands } from "@/features/brands/services/brands.service";
import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { getEodDashboard } from "@/features/eod/services/eod.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { hasPermission } from "@/shared/lib/rbac";
import { formatDate } from "@/shared/lib/utils";

export default async function EodDashboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const [dashboard, brands] = await Promise.all([
    getEodDashboard(profile.id, profile.role),
    getAllBrands(),
  ]);
  const canReview = hasPermission(profile.role, "eod:review:team");
  const canManageBrands = profile.role === "SUPER_ADMIN" || profile.role === "HR";
  const nav = getEodNavItems(profile.role);
  const activeBrands = brands.filter((brand) => brand.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <PageHeader
        title="End of Day"
        description="Submit daily updates and track team progress."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
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
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Brands</CardTitle>
            <p className="text-sm text-muted-foreground">
              Client brands tied to daily work, campaigns, and reporting.
            </p>
          </div>
          {canManageBrands ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/eod/brands">View brands</Link>
              </Button>
              <Button asChild>
                <Link href="/eod/brands/new">
                  <Plus className="h-4 w-4" />
                  Add Brand
                </Link>
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{activeBrands.length} active brands</span>
            <span>-</span>
            <span>{brands.length} total brands</span>
          </div>
          {activeBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active brands yet. HR can add the first client account here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeBrands.slice(0, 6).map((brand) => (
                <Badge key={brand.id} variant="secondary">
                  {brand.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                      {update.tasks_completed.length} tasks - {update.hours_worked}h
                    </p>
                    {update.brand ? (
                      <Badge variant="outline" className="mt-2">
                        {update.brand.name}
                      </Badge>
                    ) : null}
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
