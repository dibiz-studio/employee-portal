import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { AssignKpiForm } from "@/features/kpi/components/assign-kpi-form";
import {
  getAssignableEmployees,
  getKpiTemplates,
} from "@/features/kpi/services/kpi.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";

export default async function AssignKpiPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);

  const [employees, templates] = await Promise.all([
    getAssignableEmployees(profile.role, profile.id),
    getKpiTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <PageHeader
        title="Assign KPI"
        description="Set performance targets for team members"
        backHref="/kpi"
        backLabel="Back to KPI dashboard"
      />

      <AssignKpiForm employees={employees} templates={templates} />
    </div>
  );
}
