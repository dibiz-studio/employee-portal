"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import type { DailyUpdateRow } from "@/features/eod/services/eod.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/utils";

interface EmployeeEodHistoryProps {
  employeeId: string;
  employeeName: string;
  updates: DailyUpdateRow[];
}

export function EmployeeEodHistory({
  employeeId,
  employeeName,
  updates,
}: EmployeeEodHistoryProps) {
  const submittedCount = updates.length;
  const reviewedCount = updates.filter((update) => update.reviewed_at).length;
  const totalHours = updates.reduce((sum, update) => sum + update.hours_worked, 0);

  if (updates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No EOD submissions"
        description={`${employeeName} has not submitted any EOD updates yet.`}
        actionLabel="Back to EOD"
        actionHref="/eod"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submissions</CardDescription>
            <CardTitle className="text-2xl">{submittedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reviewed</CardDescription>
            <CardTitle className="text-2xl">{reviewedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total hours</CardDescription>
            <CardTitle className="text-2xl">{totalHours}h</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>EOD history</CardTitle>
          <CardDescription>
            All daily updates recorded for {employeeName}. View the full profile at{" "}
            <Link
              href={`/employees/${employeeId}`}
              className="font-medium text-primary hover:underline"
            >
              employee profile
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updates.map((update) => (
                <TableRow key={update.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{formatDate(update.report_date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.reviewed_at
                          ? `Reviewed ${formatDate(update.reviewed_at)}`
                          : "Awaiting review"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{update.hours_worked}h</TableCell>
                  <TableCell className="max-w-[420px]">
                    <ul className="space-y-1 text-sm">
                      {update.tasks_completed.map((task, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="line-clamp-2">{task}</span>
                        </li>
                      ))}
                    </ul>
                    {update.blockers ? (
                      <Badge variant="warning" className="mt-2">
                        {update.blockers}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={update.reviewed_at ? "COMPLETED" : "PENDING"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
