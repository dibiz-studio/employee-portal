import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getDepartmentsList } from "@/features/employees/services/employee.service";
import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { CreateTemplateForm } from "@/features/kpi/components/create-template-form";
import { PageHeader } from "@/shared/components/data/page-header";
import { Button } from "@/shared/components/ui/button";

export default async function NewKpiTemplatePage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const departments = await getDepartmentsList();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/kpi/templates">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to templates
        </Link>
      </Button>

      <PageHeader
        title="Create KPI template"
        description="Define a reusable performance goal template"
      />

      <CreateTemplateForm departments={departments} />
    </div>
  );
}
