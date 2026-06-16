"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/** Route-segment → human-readable label overrides */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  departments: "Departments",
  kpi: "KPI",
  templates: "Templates",
  assign: "Assign",
  analytics: "Analytics",
  leaderboard: "Leaderboard",
  leave: "Leave",
  eod: "EOD",
  payroll: "Payroll",
  reports: "Reports",
  settings: "Settings",
  company: "Company",
  profile: "Profile",
  roles: "Roles",
  notifications: "Notifications",
  audit: "Audit Logs",
  new: "New",
};

function toLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

interface BreadcrumbsProps {
  /** Extra trailing crumb label (e.g., entity name like "John Doe") */
  trailingLabel?: string;
  className?: string;
}

export function Breadcrumbs({ trailingLabel, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  if (pathname === "/dashboard") return null;

  // Strip route-group segments like (app), (portal), (auth)
  const segments = pathname
    .split("/")
    .filter((s) => s && !s.startsWith("(") && !s.endsWith(")"));

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label =
      isLast && trailingLabel ? trailingLabel : toLabel(segment);

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate max-w-[200px] transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
