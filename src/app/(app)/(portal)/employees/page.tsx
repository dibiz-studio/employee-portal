import Link from "next/link";
import { Building2, Plus, UserPlus, Users } from "lucide-react";

import { EmployeeDirectory } from "@/features/employees/components/employee-directory";
import {
  getEmployees,
  getEmployeeStats,
} from "@/features/employees/services/employee.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { Button } from "@/shared/components/ui/button";

export default async function EmployeesPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const [employees, stats] = await Promise.all([
    getEmployees(profile.role, profile.id),
    getEmployeeStats(profile.role, profile.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Organization directory and team roster"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/employees/departments">
                <Building2 className="mr-2 h-4 w-4" />
                Departments
              </Link>
            </Button>
            {["SUPER_ADMIN", "HR"].includes(profile.role) ? (
              <Button asChild>
                <Link href="/employees/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add employee
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} icon={Users} />
        <StatCard title="Active" value={stats.active} icon={UserPlus} />
        <StatCard
          title="On leave"
          value={stats.onLeave}
          icon={Users}
          description="Currently on leave"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
        />
      </div>

      <EmployeeDirectory employees={employees} />
    </div>
  );
}
