import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ScrollText,
  Settings,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import type { AppRole } from "@/shared/types/roles";

export type Permission =
  | "employees:read"
  | "employees:read:team"
  | "employees:read:self"
  | "employees:create"
  | "employees:update"
  | "employees:delete"
  | "kpi:read"
  | "kpi:read:team"
  | "kpi:read:self"
  | "kpi:templates:manage"
  | "kpi:assign"
  | "kpi:edit:team"
  | "kpi:edit:self"
  | "kpi:delete"
  | "leave:read"
  | "leave:apply"
  | "leave:approve"
  | "leave:policies:manage"
  | "eod:submit"
  | "eod:review:team"
  | "payroll:read"
  | "payroll:read:self"
  | "payroll:read:summary"
  | "payroll:manage"
  | "payroll:settings"
  | "reports:org"
  | "reports:department"
  | "reports:team"
  | "reports:self"
  | "settings:company"
  | "settings:departments"
  | "settings:roles"
  | "settings:policies"
  | "settings:profile"
  | "audit:read";

export const ROLE_DASHBOARD_PATHS: Record<AppRole, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  HR: "/dashboard/hr",
  MANAGER: "/dashboard/manager",
  EMPLOYEE: "/dashboard/employee",
  INTERN: "/dashboard/intern",
};

const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  SUPER_ADMIN: ["*"],
  HR: [
    "employees:*",
    "kpi:*",
    "leave:*",
    "eod:*",
    "payroll:*",
    "reports:org",
    "reports:department",
    "reports:team",
    "reports:self",
    "settings:departments",
    "settings:roles",
    "settings:policies",
    "settings:profile",
    "audit:read",
  ],
  MANAGER: [
    "employees:read:team",
    "kpi:read:team",
    "kpi:assign",
    "kpi:edit:team",
    "leave:read",
    "leave:apply",
    "leave:approve",
    "eod:submit",
    "eod:review:team",
    "payroll:read",
    "payroll:read:self",
    "reports:department",
    "reports:team",
    "reports:self",
    "settings:profile",
  ],
  EMPLOYEE: [
    "kpi:read:self",
    "kpi:edit:self",
    "leave:read",
    "leave:apply",
    "eod:submit",
    "payroll:read:self",
    "reports:self",
    "settings:profile",
  ],
  INTERN: [
    "kpi:read:self",
    "kpi:edit:self",
    "leave:read",
    "leave:apply",
    "eod:submit",
    "payroll:read:summary",
    "reports:self",
    "settings:profile",
  ],
};

function matchesPermission(granted: string, required: Permission): boolean {
  if (granted === "*") return true;

  if (granted.endsWith(":*")) {
    const prefix = granted.slice(0, -1);
    return required.startsWith(prefix);
  }

  return granted === required;
}

export function hasPermission(
  role: AppRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];
  return permissions.some((granted) => matchesPermission(granted, permission));
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
  section: "main" | "footer";
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["SUPER_ADMIN", "HR", "MANAGER"],
    section: "main",
  },
  {
    label: "KPI",
    href: "/kpi",
    icon: Target,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "Leaves",
    href: "/leave",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "EOD",
    href: "/eod",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: Wallet,
    roles: ["SUPER_ADMIN", "HR"],
    section: "main",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "main",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"],
    section: "footer",
  },
  {
    label: "Audit Logs",
    href: "/audit",
    icon: ScrollText,
    roles: ["SUPER_ADMIN", "HR"],
    section: "footer",
  },
];

export function canAccessNav(
  role: AppRole | null | undefined,
  item: NavItem,
): boolean {
  if (!role) return false;
  return item.roles.includes(role);
}

export function getNavItemsForRole(
  role: AppRole | null | undefined,
  section?: NavItem["section"],
): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      canAccessNav(role, item) && (section ? item.section === section : true),
  );
}
