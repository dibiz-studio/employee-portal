import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  href,
}: StatCardProps) {
  const isPositive = trend ? trend.value >= 0 : undefined;

  const content = (
    <Card className={cn(className, href && "hover:border-primary/50 transition-colors cursor-pointer")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? (
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-stat font-semibold tabular-nums">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend ? (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" aria-hidden />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" aria-hidden />
            )}
            <span
              className={cn(
                "font-medium tabular-nums",
                isPositive ? "text-success" : "text-destructive",
              )}
            >
              {isPositive ? "+" : ""}
              {trend.value}%
            </span>
            {trend.label ? (
              <span className="text-muted-foreground">{trend.label}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
