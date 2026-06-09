import Link from "next/link";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getPayrollSettings } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export default async function PayrollSettingsHubPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const settings = await getPayrollSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Settings"
        description="Allowance and deduction configuration."
        actions={
          <Button variant="outline" asChild>
            <Link href="/payroll/settings">Advanced Settings</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allowances</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {settings.allowanceTypes.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deductions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {settings.deductionTypes.map((type) => (
              <Badge key={type} variant="outline" className="capitalize">
                {type}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
