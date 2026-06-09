import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { AssignKpiForm } from "@/features/kpi/components/assign-kpi-form";
import {
  getAssignableEmployees,
  getKpiTemplates,
} from "@/features/kpi/services/kpi.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { Button } from "@/shared/components/ui/button";

export default async function AssignKpiPage() {
  const profile = await requireRole(["SUPER_ADMIN", "HR", "MANAGER"]);

  const [employees, templates] = await Promise.all([
    getAssignableEmployees(profile.role, profile.id),
    getKpiTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/kpi">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to KPI
        </Link>
      </Button>

      <PageHeader
        title="Assign KPI"
        description="Set performance targets for team members"
      />

      <AssignKpiForm employees={employees} templates={templates} />
    </div>
  );
}
