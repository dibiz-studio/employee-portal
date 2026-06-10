"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Target,
  User,
} from "lucide-react";

import { canAccessNav } from "@/shared/lib/rbac";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/stores/auth-store";
import type { AppRole } from "@/shared/types/roles";

const MOBILE_BOTTOM_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"] as AppRole[],
  },
  {
    label: "Tasks",
    href: "/kpi",
    icon: Target,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"] as AppRole[],
  },
  {
    label: "Leaves",
    href: "/leave",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"] as AppRole[],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"] as AppRole[],
  },
  {
    label: "Profile",
    href: "/settings/profile",
    icon: User,
    roles: ["SUPER_ADMIN", "HR", "MANAGER", "EMPLOYEE", "INTERN"] as AppRole[],
  },
] as const;

interface MobileBottomNavProps {
  initialRole?: AppRole;
}

export function MobileBottomNav({ initialRole }: MobileBottomNavProps) {
  const pathname = usePathname();
  const storeRole = useAuthStore((state) => state.profile?.role);
  const role = storeRole ?? initialRole;

  const visibleItems = MOBILE_BOTTOM_ITEMS.filter((item) =>
    role ? canAccessNav(role, { ...item, section: "main" }) : false,
  );

  if (!role || visibleItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-500/15 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-2 text-xs transition-colors",
                isActive
                  ? "text-orange-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
