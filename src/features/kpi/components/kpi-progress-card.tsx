"use client";

import { format } from "date-fns";

import { calcProgress } from "@/features/kpi/lib/utils";
import type { EmployeeKpi } from "@/features/kpi/types";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";

interface KpiProgressCardProps {
  kpi: EmployeeKpi;
  showEmployee?: boolean;
}

export function KpiProgressCard({ kpi, showEmployee }: KpiProgressCardProps) {
  const progress = calcProgress(kpi);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{kpi.title}</CardTitle>
            {kpi.description ? (
              <CardDescription className="line-clamp-2">
                {kpi.description}
              </CardDescription>
            ) : null}
          </div>
          <StatusBadge status={kpi.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showEmployee && kpi.employee ? (
          <p className="text-sm text-muted-foreground">{kpi.employee.full_name}</p>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium tabular-nums">
            {kpi.current_value} / {kpi.target_value} {kpi.unit}
          </span>
        </div>
        <Progress value={progress} />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{kpi.period}</Badge>
          {kpi.template?.category ? (
            <Badge variant="outline">{kpi.template.category}</Badge>
          ) : null}
          <span>
            {format(new Date(kpi.period_start), "MMM d")} –{" "}
            {format(new Date(kpi.period_end), "MMM d, yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
