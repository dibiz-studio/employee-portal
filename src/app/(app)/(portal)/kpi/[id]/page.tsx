import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { format } from "date-fns";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { calcProgress } from "@/features/kpi/lib/utils";
import { getEmployeeKpis, getKpiById } from "@/features/kpi/services/kpi.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatCard } from "@/shared/components/data/stat-card";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface KpiDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function KpiDetailPage({ params }: KpiDetailPageProps) {
  const { id } = await params;
  const profile = await getServerProfile();

  if (!profile) return null;

  const [kpi, allKpis] = await Promise.all([
    getKpiById(profile.role, profile.id, id),
    getEmployeeKpis(profile.role, profile.id),
  ]);

  if (!kpi) notFound();

  const progress = calcProgress(kpi);
  const remainingValue = Math.max(kpi.target_value - kpi.current_value, 0);
  const employeeName = kpi.employee?.full_name ?? "Employee";
  const relatedKpis = allKpis.filter(
    (item) => item.employee_id === kpi.employee_id,
  );
  const otherKpis = relatedKpis.filter((item) => item.id !== kpi.id);
  const averageRelatedProgress =
    relatedKpis.length > 0
      ? Math.round(
          relatedKpis.reduce((sum, item) => sum + calcProgress(item), 0) /
            relatedKpis.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs trailingLabel={kpi.title} />
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/kpi">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to KPI dashboard
        </Link>
      </Button>

      <PageHeader
        title={kpi.title}
        description={`${employeeName} · ${kpi.template?.category ?? "Uncategorized"} · ${kpi.period}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/employees/${kpi.employee_id}`}>
              <Users className="mr-2 h-4 w-4" />
              View employee
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Progress"
          value={`${progress}%`}
          icon={Target}
          description={`Weight ${kpi.weight}%`}
        />
        <StatCard
          title="Current"
          value={`${kpi.current_value} ${kpi.unit}`}
          icon={BarChart3}
          description={`Target ${kpi.target_value} ${kpi.unit}`}
        />
        <StatCard
          title="Remaining"
          value={`${remainingValue} ${kpi.unit}`}
          icon={TrendingUp}
          description="Left to reach target"
        />
        <StatCard
          title="Period"
          value={kpi.period}
          icon={CalendarDays}
          description={`${format(new Date(kpi.period_start), "MMM d")} - ${format(
            new Date(kpi.period_end),
            "MMM d, yyyy",
          )}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assignment overview</CardTitle>
            <CardDescription>
              Full KPI ownership and tracking information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={kpi.status} />
                <Badge variant="secondary">{kpi.period}</Badge>
                {kpi.template?.category ? (
                  <Badge variant="outline">{kpi.template.category}</Badge>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium tabular-nums">
                    {kpi.current_value} / {kpi.target_value} {kpi.unit}
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Template
                </p>
                <p className="font-medium">{kpi.template?.name ?? kpi.title}</p>
                <p className="text-sm text-muted-foreground">
                  {kpi.description ?? "No description provided."}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="font-medium">Manager update</p>
                <p className="text-sm text-muted-foreground">
                  {kpi.notes ?? "No notes have been added yet."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Started
                </p>
                <p className="font-medium">
                  {format(new Date(kpi.period_start), "MMM d, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Due
                </p>
                <p className="font-medium">
                  {format(new Date(kpi.period_end), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner details</CardTitle>
            <CardDescription>Who is responsible for this KPI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Link
              href={`/employees/${kpi.employee_id}`}
              className="flex items-center gap-3 transition-colors hover:text-primary"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={kpi.employee?.avatar_url ?? undefined}
                  alt={employeeName}
                />
                <AvatarFallback>{getInitials(employeeName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{employeeName}</p>
                <p className="text-sm text-muted-foreground">Open employee profile</p>
              </div>
            </Link>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Employee ID
                </p>
                <p className="mt-1 font-mono text-sm">{kpi.employee_id}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={kpi.status} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Workload summary
              </p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignments</span>
                  <span className="font-medium tabular-nums">
                    {relatedKpis.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average progress</span>
                  <span className="font-medium tabular-nums">
                    {averageRelatedProgress}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other KPIs for {employeeName}</CardTitle>
          <CardDescription>
            Work assigned to the same employee during the current scope
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {otherKpis.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Target}
                title="No other KPIs assigned"
                description="This employee currently has only one KPI in the selected scope."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherKpis.map((item) => {
                  const itemProgress = calcProgress(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[320px]">
                        <div className="space-y-1">
                          <Link
                            href={`/kpi/${item.id}`}
                            className="block truncate font-medium transition-colors hover:text-primary"
                          >
                            {item.title}
                          </Link>
                          {item.description ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[180px]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>{itemProgress}% complete</span>
                            <span className="whitespace-nowrap tabular-nums">
                              {item.current_value} / {item.target_value} {item.unit}
                            </span>
                          </div>
                          <Progress value={itemProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <Badge variant="secondary">{item.period}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/kpi/${item.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
