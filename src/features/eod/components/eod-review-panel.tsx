"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { DailyUpdateRow } from "@/features/eod/services/eod.service";
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

interface EodReviewPanelProps {
  updates: DailyUpdateRow[];
  reviewerId: string;
}

export function EodReviewPanel({ updates, reviewerId }: EodReviewPanelProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReview = async (updateId: string) => {
    setLoadingId(updateId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("daily_updates")
        .update({
          manager_comment: comments[updateId] || null,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", updateId);

      if (error) throw error;
      toast.success("Review saved");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save review",
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (updates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No team EOD submissions to review.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Tasks</TableHead>
          <TableHead>Review</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {updates.map((update) => (
          <TableRow key={update.id}>
            <TableCell className="font-medium">
            <Link
              href={`/eod/employee/${update.employee_id}`}
              className="transition-colors hover:text-primary hover:underline"
            >
              {update.employee_name}
            </Link>
          </TableCell>
            <TableCell>{formatDate(update.report_date)}</TableCell>
            <TableCell>{update.hours_worked}h</TableCell>
            <TableCell className="max-w-[240px]">
              <ul className="list-inside list-disc text-sm">
                {update.tasks_completed.map((task, i) => (
                  <li key={i} className="truncate">
                    {task}
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                {update.reviewed_at ? (
                  <p className="text-xs text-muted-foreground">
                    Reviewed {formatDate(update.reviewed_at)}
                  </p>
                ) : null}
                <Textarea
                  placeholder="Manager comment"
                  rows={2}
                  defaultValue={update.manager_comment ?? ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [update.id]: e.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  disabled={loadingId === update.id}
                  onClick={() => handleReview(update.id)}
                >
                  Save Review
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

