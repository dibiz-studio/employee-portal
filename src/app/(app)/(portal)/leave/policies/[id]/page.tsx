import { notFound } from "next/navigation";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { PolicyForm } from "@/features/leave/components/policy-form";
import { getLeavePolicy } from "@/features/leave/services/leave.service";
import { PageHeader } from "@/shared/components/data/page-header";

interface PolicyEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PolicyEditPage({ params }: PolicyEditPageProps) {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const { id } = await params;
  const policy = await getLeavePolicy(id);

  if (!policy) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={policy.name}
        description={`Edit leave policy ${policy.code}`}
        backHref="/leave/policies"
        backLabel="Back to policies"
      />
      <PolicyForm policy={policy} />
    </div>
  );
}
