import Link from "next/link";
import { Building2, Plus, Users } from "lucide-react";

import { getDepartmentsWithStats } from "@/features/employees/services/employee.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { EmptyState } from "@/shared/components/data/empty-state";
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DepartmentsPage() {
  await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const departments = await getDepartmentsWithStats();

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Departments"
        description="Organizational structure and headcount by department"
        backHref="/employees"
        backLabel="Back to Employees"
        actions={
          <Button asChild>
            <Link href="/settings/departments">
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>{dept.code}</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {dept.employee_count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dept.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dept.description}
                </p>
              ) : null}
              {dept.head ? (
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={dept.head.avatar_url ?? undefined}
                      alt={dept.head.full_name}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(dept.head.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Department head</p>
                    <p className="font-medium">{dept.head.full_name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No head assigned</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments yet"
          description="Create your first department to organize your team structure."
          actionLabel="Add Department"
          actionHref="/settings/departments"
        />
      ) : null}
    </div>
  );
}
