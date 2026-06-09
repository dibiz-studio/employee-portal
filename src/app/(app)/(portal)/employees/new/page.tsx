import { CreateEmployeeForm } from "@/features/employees/components/create-employee-form";
import { getDepartmentsList } from "@/features/employees/services/employee.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { PageHeader } from "@/shared/components/data/page-header";

export default async function NewEmployeePage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const departments = await getDepartmentsList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add employee"
        description="Create a new employee account and HR profile"
      />
      <CreateEmployeeForm departments={departments} />
    </div>
  );
}
