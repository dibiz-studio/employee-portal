import { Badge, type BadgeProps } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

export type StatusType =
  | "ACTIVE"
  | "APPROVED"
  | "ON_TRACK"
  | "PENDING"
  | "IN_PROGRESS"
  | "REJECTED"
  | "AT_RISK"
  | "TERMINATED"
  | "DRAFT"
  | "NOT_STARTED"
  | "CANCELLED"
  | "COMPLETED";

const STATUS_VARIANTS: Record<StatusType, BadgeProps["variant"]> = {
  ACTIVE: "success",
  APPROVED: "success",
  ON_TRACK: "success",
  COMPLETED: "success",
  PENDING: "warning",
  IN_PROGRESS: "warning",
  REJECTED: "destructive",
  AT_RISK: "destructive",
  TERMINATED: "destructive",
  CANCELLED: "destructive",
  DRAFT: "secondary",
  NOT_STARTED: "secondary",
};

const STATUS_LABELS: Record<StatusType, string> = {
  ACTIVE: "Active",
  APPROVED: "Approved",
  ON_TRACK: "On Track",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REJECTED: "Rejected",
  AT_RISK: "At Risk",
  TERMINATED: "Terminated",
  DRAFT: "Draft",
  NOT_STARTED: "Not Started",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_") as StatusType;
  const variant = STATUS_VARIANTS[normalized] ?? "outline";
  const displayLabel = label ?? STATUS_LABELS[normalized] ?? status;

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {displayLabel}
    </Badge>
  );
}
