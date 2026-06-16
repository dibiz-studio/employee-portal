import { notFound } from "next/navigation";

import { EmployeeDetailTabs } from "@/features/employees/components/employee-detail-tabs";
import {
  getEmployeeByProfileId,
  getEmployeeLeaveRequests,
  requireEmployeeAccess,
} from "@/features/employees/services/employee.service";
import { getEmployeeKpis } from "@/features/kpi/services/kpi.service";
import { getEmployeeEodHistory as getEodHistory } from "@/features/eod/services/eod.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ROLE_LABELS } from "@/shared/types/roles";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const viewer = await requireEmployeeAccess(id);

  const [employee, kpis, leaveRequests, eodHistory] = await Promise.all([
    getEmployeeByProfileId(id),
    getEmployeeKpis(viewer.role, viewer.id, id),
    getEmployeeLeaveRequests(id),
    getEodHistory(id),
  ]);

  if (!employee) notFound();

  const { profile, department } = employee;

  return (
    <div className="space-y-6">
      <Breadcrumbs trailingLabel={profile.full_name} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={profile.avatar_url ?? undefined}
            alt={profile.full_name}
          />
          <AvatarFallback className="text-lg">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <PageHeader
            title={profile.full_name}
            description={`${employee.job_title}${department ? ` - ${department.name}` : ""}`}
            className="pb-0"
            backHref="/employees"
            backLabel="Back to directory"
          />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={employee.employment_status} />
            <Badge variant="outline">{ROLE_LABELS[profile.role]}</Badge>
            <span className="font-mono text-sm text-muted-foreground">
              {employee.employee_code}
            </span>
          </div>
        </div>
      </div>

      <EmployeeDetailTabs
        employee={employee}
        kpis={kpis}
        leaveRequests={leaveRequests}
        eodHistory={eodHistory}
      />
    </div>
  );
}

