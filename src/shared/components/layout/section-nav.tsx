"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

interface SectionNavItem {
  label: string;
  href: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  className?: string;
}

export function SectionNav({ items, className }: SectionNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-wrap gap-2 border-b border-border pb-4",
        className,
      )}
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border border-orange-500/30 bg-orange-500/10 text-orange-300 shadow-[0_0_0_1px_rgba(249,115,22,0.08)]"
                : "text-muted-foreground hover:bg-orange-500/10 hover:text-orange-300",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
