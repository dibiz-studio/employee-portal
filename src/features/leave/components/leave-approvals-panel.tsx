"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { LeaveRequestRow } from "@/features/leave/services/leave.service";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { createClient } from "@/shared/lib/supabase/client";
import { formatDate } from "@/shared/lib/utils";

interface LeaveApprovalsPanelProps {
  requests: LeaveRequestRow[];
  reviewerId: string;
}

export function LeaveApprovalsPanel({
  requests,
  reviewerId,
}: LeaveApprovalsPanelProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReview = async (
    requestId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setLoadingId(requestId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: notes[requestId] || null,
        })
        .eq("id", requestId)
        .eq("status", "PENDING");

      if (error) throw error;
      toast.success(`Leave request ${status.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update request",
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pending leave requests to review.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Policy</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.employee_name}
              </TableCell>
              <TableCell>{request.policy_name}</TableCell>
              <TableCell>
                {formatDate(request.start_date)} –{" "}
                {formatDate(request.end_date)}
              </TableCell>
              <TableCell>{request.days_requested}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.reason}
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <StatusBadge status={request.status} />
                  <Textarea
                    placeholder="Review notes (optional)"
                    rows={2}
                    value={notes[request.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [request.id]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={loadingId === request.id}
                      onClick={() => handleReview(request.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={loadingId === request.id}
                      onClick={() => handleReview(request.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
