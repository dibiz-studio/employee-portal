import { hasPermission } from "@/shared/lib/rbac";
import type { AppRole } from "@/shared/types/roles";

export interface LeaveNavItem {
  label: string;
  href: string;
}

export function getLeaveNavItems(role: AppRole | null | undefined): LeaveNavItem[] {
  const items: LeaveNavItem[] = [
    { label: "Overview", href: "/leave" },
    { label: "Apply", href: "/leave/apply" },
    { label: "History", href: "/leave/history" },
    { label: "Calendar", href: "/leave/calendar" },
    { label: "Analytics", href: "/leave/analytics" },
  ];

  if (hasPermission(role, "leave:approve")) {
    items.push({ label: "Approvals", href: "/leave/approvals" });
  }

  if (hasPermission(role, "leave:policies:manage")) {
    items.push({ label: "Policies", href: "/leave/policies" });
  }

  return items;
}
