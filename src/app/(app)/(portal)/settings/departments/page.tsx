import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { DepartmentForm } from "@/features/settings/components/department-form";
import { getDepartments } from "@/features/settings/services/settings.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { asSingleRelation } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

type Department = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  profiles?: { full_name?: string }[];
};

export default async function DepartmentsSettingsPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Departments"
        description="Create and manage your organization structure."
        actions={<DepartmentForm />}
      />

      {departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department to assign employees and run reports."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept: Department) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.code}</TableCell>
                <TableCell>
                  {asSingleRelation(dept.profiles)?.full_name ?? "-"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={dept.is_active ? "ACTIVE" : "TERMINATED"}
                    label={dept.is_active ? "Active" : "Inactive"}
                  />
                </TableCell>
                <TableCell className="max-w-[240px] truncate">
                  {dept.description ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
