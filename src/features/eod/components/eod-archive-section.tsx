"use client";

import { useState } from "react";
import { Download, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

import type { AppRole } from "@/shared/types/roles";
import type { DailyUpdateRow } from "@/features/eod/services/eod.service";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
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
import { StatusBadge } from "@/shared/components/data/status-badge";

interface EodArchiveSectionProps {
  year: string;
  month: string;
  role: AppRole;
  employeeId?: string; // Optional, to filter by employee if needed
}

export function EodArchiveSection({ year, month, role, employeeId }: EodArchiveSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updates, setUpdates] = useState<DailyUpdateRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const monthDate = new Date(parseInt(year), parseInt(month) - 1);
  const monthName = format(monthDate, "MMMM yyyy");
  const canExport = role === "HR" || role === "SUPER_ADMIN";

  const loadData = async () => {
    if (updates.length > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/eod/archive?year=${year}&month=${month}${employeeId ? `&employeeId=${employeeId}` : ""}`
      );
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
      const res = await fetch(
        `/api/eod/export?month=${year}-${month}${employeeId ? `&employeeId=${employeeId}` : ""}`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EOD_Archive_${year}_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border-muted-foreground/20 bg-muted/10">
      <div 
        className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/20"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadData();
        }}
      >
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">Archived — {monthName}</CardTitle>
          {updates.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {updates.length} updates
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          {canExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={isExporting}
              className="h-8"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              {isExporting ? "Exporting..." : "Export Excel"}
            </Button>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <CardContent className="border-t border-muted-foreground/20 p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading archive data...
            </div>
          ) : updates.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No updates found for this month.
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    {!employeeId && <TableHead>Employee</TableHead>}
                    <TableHead>Hours</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{formatDate(update.report_date)}</div>
                        {update.brand && (
                          <Badge variant="outline" className="mt-1 w-fit">
                            {update.brand.name}
                          </Badge>
                        )}
                      </TableCell>
                      {!employeeId && (
                        <TableCell className="align-top">
                          <div className="font-medium">{update.employee_name}</div>
                        </TableCell>
                      )}
                      <TableCell className="align-top tabular-nums">{update.hours_worked}h</TableCell>
                      <TableCell className="align-top">
                        <ul className="space-y-1 text-sm">
                          {(Array.isArray(update.tasks_completed) ? update.tasks_completed : []).map((task, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span className="line-clamp-2">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusBadge status={update.reviewed_at ? "COMPLETED" : "PENDING"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
