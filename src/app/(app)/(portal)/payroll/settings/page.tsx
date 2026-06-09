import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getPayrollSettings } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

const PAYROLL_NAV = [
  { label: "Dashboard", href: "/payroll" },
  { label: "Settings", href: "/payroll/settings" },
];

export default async function PayrollSettingsPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const settings = await getPayrollSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Settings"
        description="Allowance and deduction types used in payroll records."
      />
      <SectionNav items={PAYROLL_NAV} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allowance Types</CardTitle>
            <CardDescription>
              Derived from {settings.sampleCount} recent payroll records
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {settings.allowanceTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No allowances configured.</p>
            ) : (
              settings.allowanceTypes.map((type) => (
                <Badge key={type} variant="secondary" className="capitalize">
                  {type}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deduction Types</CardTitle>
            <CardDescription>
              Tax, PF, and other deduction categories
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {settings.deductionTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deductions configured.</p>
            ) : (
              settings.deductionTypes.map((type) => (
                <Badge key={type} variant="outline" className="capitalize">
                  {type}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
