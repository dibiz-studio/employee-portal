"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { getNavItemsForRole } from "@/shared/lib/rbac";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROLE_LABELS, type AppRole } from "@/shared/types/roles";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRole?: AppRole;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MobileNavDrawer({
  open,
  onOpenChange,
  initialRole,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role ?? initialRole;

  const mainNav = getNavItemsForRole(role, "main");
  const footerNav = getNavItemsForRole(role, "footer");

  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0"
        aria-label="Main navigation"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="border-b border-border p-4 text-left">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.full_name ?? "User"}
              />
              <AvatarFallback>
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">
                {profile?.full_name ?? "User"}
              </SheetTitle>
              {role ? (
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[role]}
                </p>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        <nav className="scrollbar-hidden flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {mainNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {footerNav.length > 0 ? (
          <div className="mt-auto border-t border-border p-2">
            <Separator className="mb-2" />
            {footerNav.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
