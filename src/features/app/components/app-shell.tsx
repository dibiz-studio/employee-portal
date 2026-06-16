"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AppHeader } from "@/shared/components/layout/app-header";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { MobileBottomNav } from "@/shared/components/layout/mobile-bottom-nav";
import { MobileNavDrawer } from "@/shared/components/layout/mobile-nav-drawer";
import type { Profile } from "@/shared/stores/auth-store";

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile;
  notificationCount?: number;
}

export function AppShell({
  children,
  profile,
  notificationCount = 0,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar initialRole={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          notificationCount={notificationCount}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <main ref={mainRef} className="scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
        <MobileBottomNav initialRole={profile.role} />
        <MobileNavDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          initialRole={profile.role}
        />
      </div>
    </div>
  );
}
