import Link from "next/link";
import { Building2, FileText, Users } from "lucide-react";

import { getDepartmentsWithStats } from "@/features/reports/services/reports.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { hasPermission } from "@/shared/lib/rbac";
import { getServerProfile } from "@/features/auth/services/auth-server.service";

export default async function ReportsHubPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const departments = await getDepartmentsWithStats();
  const canViewOrg = hasPermission(profile.role, "reports:org");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and preview organizational reports."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canViewOrg ? (
          <Card>
            <CardHeader>
              <Building2 className="mb-2 h-8 w-8 text-muted-foreground" />
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Company-wide headcount, leave, KPI, and payroll summary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/reports/organization">View Report</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="sm:col-span-2">
          <CardHeader>
            <Users className="mb-2 h-8 w-8 text-muted-foreground" />
            <CardTitle>Department Reports</CardTitle>
            <CardDescription>
              Per-department employee and activity summaries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li
                  key={dept.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.employee_count} employees
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/reports/department/${dept.id}`}>
                      <FileText className="h-4 w-4" />
                      Report
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
