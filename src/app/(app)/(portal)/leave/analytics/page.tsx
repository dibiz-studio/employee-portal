import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getLeaveAnalytics } from "@/features/leave/services/leave.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const LEAVE_NAV = [
  { label: "Overview", href: "/leave" },
  { label: "Analytics", href: "/leave/analytics" },
  { label: "History", href: "/leave/history" },
];

export default async function LeaveAnalyticsPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const analytics = await getLeaveAnalytics(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Analytics"
        description="Overview of leave usage and request trends."
      />
      <SectionNav items={LEAVE_NAV} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Requests" value={analytics.totalRequests} />
        <StatCard title="Pending" value={analytics.pendingCount} />
        <StatCard title="Approved" value={analytics.approvedCount} />
        <StatCard
          title="Approved Days"
          value={analytics.totalApprovedDays}
          description="Total days taken"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Days by Policy</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.byPolicy.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Days Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.byPolicy.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
