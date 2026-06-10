import { getDepartmentsList } from "@/features/employees/services/employee.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { CreateTemplateForm } from "@/features/kpi/components/create-template-form";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";

export default async function NewKpiTemplatePage() {
  await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);
  const departments = await getDepartmentsList();

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Create KPI template"
        description="Define a reusable performance goal template"
        backHref="/kpi/templates"
        backLabel="Back to templates"
      />

      <CreateTemplateForm departments={departments} />
    </div>
  );
}
