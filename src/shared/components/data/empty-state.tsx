import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center py-12 text-center">
        {Icon ? (
          <div className="mb-4 rounded-full bg-muted p-3">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : null}
        <p className="text-lg font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel ? (
          actionHref ? (
            <Button className="mt-6" asChild>
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : onAction ? (
            <Button className="mt-6" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null
        ) : null}
      </CardContent>
    </Card>
  );
}
