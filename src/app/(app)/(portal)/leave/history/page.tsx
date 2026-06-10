import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getLeaveRequests } from "@/features/leave/services/leave.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/utils";

const LEAVE_NAV = [
  { label: "Overview", href: "/leave" },
  { label: "Apply", href: "/leave/apply" },
  { label: "History", href: "/leave/history" },
  { label: "Calendar", href: "/leave/calendar" },
];

export default async function LeaveHistoryPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const requests = await getLeaveRequests(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave History"
        description="All your leave requests and their status."
      />
      <SectionNav items={LEAVE_NAV} />

      {requests.length === 0 ? (
        <EmptyState
          title="No leave history"
          description="Your submitted leave requests will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.policy_name}</TableCell>
                <TableCell>{formatDate(req.start_date)}</TableCell>
                <TableCell>{formatDate(req.end_date)}</TableCell>
                <TableCell>{req.days_requested}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {req.reason}
                </TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell>{formatDate(req.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
