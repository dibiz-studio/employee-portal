"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Logo } from "@/shared/components/logo";
import { getNavItemsForRole } from "@/shared/lib/rbac";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/stores/auth-store";
import type { AppRole } from "@/shared/types/roles";

const SIDEBAR_COLLAPSED_KEY = "hrms-sidebar-collapsed";

interface AppSidebarProps {
  initialRole?: AppRole;
}

export function AppSidebar({ initialRole }: AppSidebarProps) {
  const pathname = usePathname();
  const storeRole = useAuthStore((state) => state.profile?.role);
  const role = storeRole ?? initialRole;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const mainNav = getNavItemsForRole(role, "main");
  const footerNav = getNavItemsForRole(role, "footer");

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out md:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <Link href="/dashboard">
              <Logo />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-lg font-bold text-primary"
              aria-label="Dibiz Studio home"
            >
              D
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="scrollbar-hidden flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {mainNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {footerNav.length > 0 ? (
          <div className="p-2">
            <Separator className="mb-2" />
            <nav className="flex flex-col gap-1">
              {footerNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return link;
              })}
            </nav>
          </div>
        ) : null}
      </aside>
    </TooltipProvider>
  );
}
