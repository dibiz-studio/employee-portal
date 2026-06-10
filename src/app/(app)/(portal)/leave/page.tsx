import Link from "next/link";
import { CalendarDays, Clock, Plus } from "lucide-react";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import {
  getLeaveBalances,
  getLeaveRequests,
} from "@/features/leave/services/leave.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { hasPermission } from "@/shared/lib/rbac";
import { formatDate } from "@/shared/lib/utils";

const LEAVE_NAV = [
  { label: "Overview", href: "/leave" },
  { label: "Apply", href: "/leave/apply" },
  { label: "History", href: "/leave/history" },
  { label: "Calendar", href: "/leave/calendar" },
  { label: "Analytics", href: "/leave/analytics" },
];

export default async function LeaveDashboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const [balances, recentRequests] = await Promise.all([
    getLeaveBalances(profile.id),
    getLeaveRequests(profile.id, profile.role, { limit: 5 }),
  ]);

  const totalRemaining = balances.reduce((s, b) => s + b.remaining_days, 0);
  const pendingCount = recentRequests.filter((r) => r.status === "PENDING").length;
  const canApprove = hasPermission(profile.role, "leave:approve");
  const canManagePolicies = hasPermission(profile.role, "leave:policies:manage");

  const nav = [
    ...LEAVE_NAV,
    ...(canApprove ? [{ label: "Approvals", href: "/leave/approvals" }] : []),
    ...(canManagePolicies
      ? [{ label: "Policies", href: "/leave/policies" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="View balances, apply for leave, and track requests."
        actions={
          <Button asChild>
            <Link href="/leave/apply">
              <Plus className="h-4 w-4" />
              Apply Leave
            </Link>
          </Button>
        }
      />
      <SectionNav items={nav} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Remaining Days"
          value={totalRemaining}
          icon={CalendarDays}
          description="Across all policies this year"
        />
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          icon={Clock}
          description="Awaiting approval"
        />
        <StatCard
          title="Policies"
          value={balances.length}
          description="Active allocations"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.length === 0 ? (
              <EmptyState
                title="No leave allocations"
                description="Contact HR to set up your leave policies."
              />
            ) : (
              balances.map((balance) => {
                const usedPercent =
                  balance.allocated_days > 0
                    ? (balance.used_days / balance.allocated_days) * 100
                    : 0;

                return (
                  <div key={balance.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{balance.policy_name}</span>
                      <span className="text-muted-foreground">
                        {balance.remaining_days} / {balance.allocated_days} days
                      </span>
                    </div>
                    <Progress value={usedPercent} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leave/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No leave requests"
                description="Apply for leave to request time off."
                actionLabel="Apply Leave"
                actionHref="/leave/apply"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.policy_name}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(req.start_date)} – {formatDate(req.end_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
