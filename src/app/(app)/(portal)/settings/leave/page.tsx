import Link from "next/link";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getLeaveSettings } from "@/features/settings/services/settings.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export default async function LeaveSettingsPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const policies = await getLeaveSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Settings"
        description="Organization leave policies and rules."
        actions={
          <Button asChild>
            <Link href="/leave/policies">Manage Policies</Link>
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Days/Year</TableHead>
            <TableHead>Notice</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell className="font-medium">{policy.name}</TableCell>
              <TableCell>{policy.code}</TableCell>
              <TableCell>{policy.days_per_year}</TableCell>
              <TableCell>{policy.min_notice_days} days</TableCell>
              <TableCell>
                <StatusBadge
                  status={policy.is_active ? "ACTIVE" : "TERMINATED"}
                  label={policy.is_active ? "Active" : "Inactive"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
