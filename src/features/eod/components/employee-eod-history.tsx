"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { format } from "date-fns";

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
import { EodArchiveSection } from "./eod-archive-section";

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

  // Group by month
  const grouped = updates.reduce((acc, update) => {
    const monthKey = update.report_date.substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(update);
    return acc;
  }, {} as Record<string, DailyUpdateRow[]>);

  const monthKeys = Object.keys(grouped).sort().reverse(); // newest first
  const currentMonthKey = format(new Date(), "yyyy-MM");
  
  // Active month is either current calendar month, or the most recent month if current has no data
  const activeMonthKey = monthKeys.includes(currentMonthKey) ? currentMonthKey : monthKeys[0];
  const activeUpdates = grouped[activeMonthKey] || [];
  const archivedKeys = monthKeys.filter(key => key !== activeMonthKey);

  return (
    <div className="space-y-6">
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
          <CardTitle>Active EOD — {format(new Date(`${activeMonthKey}-01`), "MMMM yyyy")}</CardTitle>
          <CardDescription>
            Current month&apos;s daily updates recorded for {employeeName}. View the full profile at{" "}
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
          {activeUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active updates for this month.</p>
          ) : (
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
                {activeUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <p className="font-medium">{formatDate(update.report_date)}</p>
                        {update.brand ? (
                          <Badge variant="outline" className="w-fit">
                            {update.brand.name}
                          </Badge>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {update.reviewed_at
                            ? `Reviewed ${formatDate(update.reviewed_at)}`
                            : "Awaiting review"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top tabular-nums">{update.hours_worked}h</TableCell>
                    <TableCell className="align-top max-w-[420px]">
                      <ul className="space-y-1 text-sm">
                        {(Array.isArray(update.tasks_completed) ? update.tasks_completed : []).map((task, index) => (
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
                    <TableCell className="align-top">
                      <StatusBadge status={update.reviewed_at ? "COMPLETED" : "PENDING"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {archivedKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground mt-8">Past Months</h3>
          {archivedKeys.map((key) => {
            const [year, month] = key.split("-");
            return (
              <EodArchiveSection
                key={key}
                year={year}
                month={month}
                role="EMPLOYEE" // fallback role just to view
                employeeId={employeeId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
