import Link from "next/link";
import { notFound } from "next/navigation";

import { getEmployeeByProfileId } from "@/features/employees/services/employee.service";
import { requireEmployeeAccess } from "@/features/employees/services/employee.service";
import { EmployeeEodHistory } from "@/features/eod/components/employee-eod-history";
import { getEmployeeEodHistory } from "@/features/eod/services/eod.service";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { PageHeader } from "@/shared/components/data/page-header";
import { Button } from "@/shared/components/ui/button";

interface EmployeeEodPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeEodPage({ params }: EmployeeEodPageProps) {
  const { id } = await params;
  const viewer = await requireEmployeeAccess(id);
  const employee = await getEmployeeByProfileId(id);

  if (!employee) notFound();

  const updates = await getEmployeeEodHistory(id);
  const { profile } = employee;
  const description =
    viewer.role === "SUPER_ADMIN"
      ? "Founder & CEO overview."
      : viewer.id === id
        ? "Your own EOD history."
        : "Team review view.";

  return (
    <div className="space-y-6">
      <Breadcrumbs trailingLabel={`${profile.full_name} EOD`} />
      <PageHeader
        title={`${profile.full_name} EOD history`}
        description={`All recorded daily updates for ${profile.full_name}. ${description}`}
        backHref="/eod"
        backLabel="Back to EOD board"
        actions={
          <Button asChild variant="outline">
            <Link href={`/employees/${profile.id}`}>Open profile</Link>
          </Button>
        }
      />

      <EmployeeEodHistory
        employeeId={profile.id}
        employeeName={profile.full_name}
        updates={updates}
      />
    </div>
  );
}
