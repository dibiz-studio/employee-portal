"use client";

import { format } from "date-fns";
import { CalendarDays, Mail, MapPin, Phone, Target } from "lucide-react";

import type { EmployeeProfile, LeaveRequestSummary } from "@/features/employees/types";
import { KpiProgressCard } from "@/features/kpi/components/kpi-progress-card";
import type { EmployeeKpi } from "@/features/kpi/types";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { ROLE_LABELS } from "@/shared/types/roles";

interface EmployeeDetailTabsProps {
  employee: EmployeeProfile;
  kpis: EmployeeKpi[];
  leaveRequests: LeaveRequestSummary[];
}

export function EmployeeDetailTabs({
  employee,
  kpis,
  leaveRequests,
}: EmployeeDetailTabsProps) {
  const { profile, department } = employee;

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="kpi">KPI ({kpis.length})</TabsTrigger>
        <TabsTrigger value="leave">Leave ({leaveRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              {profile.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              ) : null}
              {employee.work_location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.work_location}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono">{employee.employee_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline">{ROLE_LABELS[profile.role]}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={employee.employment_status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span>{department?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hire date</span>
                <span>{format(new Date(employee.hire_date), "MMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="kpi">
        {kpis.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No KPIs assigned"
            description="This employee has no KPIs for the current period."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {kpis.map((kpi) => (
              <KpiProgressCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="leave">
        {leaveRequests.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No leave requests"
            description="Leave history will appear here once requests are submitted."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Leave history</CardTitle>
              <CardDescription>Recent leave requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.policy?.name ?? "Leave"}</TableCell>
                        <TableCell>
                          {format(new Date(req.start_date), "MMM d")} –{" "}
                          {format(new Date(req.end_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{req.days_requested}</TableCell>
                        <TableCell>
                          <StatusBadge status={req.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 p-4 md:hidden">
                {leaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-lg border p-3 space-y-1 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {req.policy?.name ?? "Leave"}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-muted-foreground">
                      {format(new Date(req.start_date), "MMM d")} –{" "}
                      {format(new Date(req.end_date), "MMM d, yyyy")} ·{" "}
                      {req.days_requested} days
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
