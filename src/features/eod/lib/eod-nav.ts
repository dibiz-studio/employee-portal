import { hasPermission } from "@/shared/lib/rbac";
import type { AppRole } from "@/shared/types/roles";

export interface EodNavItem {
  label: string;
  href: string;
}

export function getEodNavItems(role: AppRole | null | undefined): EodNavItem[] {
  const items: EodNavItem[] = [
    { label: "Overview", href: "/eod" },
    { label: "Submit", href: "/eod/submit" },
    { label: "History", href: "/eod/history" },
  ];

  if (hasPermission(role, "eod:review:team")) {
    items.push({ label: "Review", href: "/eod/review" });
  }

  if (role === "SUPER_ADMIN" || role === "HR") {
    items.push({ label: "Brands", href: "/eod/brands" });
    items.push({ label: "Archive", href: "/eod/archive" });
  }

  return items;
}
