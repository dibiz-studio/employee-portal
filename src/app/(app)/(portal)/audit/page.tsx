import { requireRole } from "@/features/dashboard/services/dashboard.service";
import { getAuditLogs } from "@/features/audit/services/audit.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDateTime } from "@/shared/lib/utils";

export default async function AuditPage() {
  await requireRole(["SUPER_ADMIN", "HR"]);
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track sensitive actions across the system."
      />

      {logs.length === 0 ? (
        <EmptyState
          title="No audit logs"
          description="System activity will be recorded here as actions occur."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </TableCell>
                <TableCell>{log.actor_name}</TableCell>
                <TableCell>
                  <StatusBadge status={log.action} label={log.action} />
                </TableCell>
                <TableCell>{log.entity_type}</TableCell>
                <TableCell className="max-w-[120px] truncate font-mono text-xs">
                  {log.entity_id ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
