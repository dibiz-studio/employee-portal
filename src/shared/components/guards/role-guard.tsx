"use client";

import type { ReactNode } from "react";

import { useAuthStore } from "@/shared/stores/auth-store";
import type { AppRole } from "@/shared/types/roles";

interface RoleGuardProps {
  allowed: AppRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({ allowed, fallback = null, children }: RoleGuardProps) {
  const role = useAuthStore((state) => state.profile?.role);

  if (!role || !allowed.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
