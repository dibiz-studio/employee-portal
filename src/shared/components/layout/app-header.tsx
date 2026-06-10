"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Settings, User } from "lucide-react";

import { useAuth } from "@/features/auth/components/auth-provider";
import { ThemeToggle } from "@/shared/components/theme-provider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/shared/types/roles";
import { useAuthStore } from "@/shared/stores/auth-store";
import { SearchInput } from "@/shared/components/layout/search-input";

interface AppHeaderProps {
  title?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppHeader({
  title,
  notificationCount = 0,
  onMenuClick,
}: AppHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const profile = useAuthStore((state) => state.profile);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-orange-500/15 bg-background/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 text-orange-300 hover:bg-orange-500/10 md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {title ? (
        <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
          {title}
        </h1>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block w-48 md:w-64">
          <SearchInput />
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 text-orange-300 hover:bg-orange-500/10 md:h-9 md:w-9"
          asChild
          aria-label="Notifications"
        >
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 ? (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] shadow-lg shadow-orange-500/20"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </Badge>
            ) : null}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              aria-label="Open profile menu"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.full_name ?? "User"}
                />
                <AvatarFallback>
                  {profile?.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name ?? "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
                {profile?.role ? (
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[profile.role]}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
