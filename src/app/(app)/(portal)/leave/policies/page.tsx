import Link from "next/link";

import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getLeavePolicies } from "@/features/leave/services/leave.service";
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

export default async function LeavePoliciesPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const policies = await getLeavePolicies(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Policies"
        description="Manage organization leave policies and allocations."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Days/Year</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell className="font-medium">{policy.name}</TableCell>
              <TableCell>{policy.code}</TableCell>
              <TableCell>{policy.days_per_year}</TableCell>
              <TableCell>{policy.is_paid ? "Yes" : "No"}</TableCell>
              <TableCell>{policy.requires_approval ? "Required" : "Auto"}</TableCell>
              <TableCell>
                <StatusBadge
                  status={policy.is_active ? "ACTIVE" : "TERMINATED"}
                  label={policy.is_active ? "Active" : "Inactive"}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/leave/policies/${policy.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
