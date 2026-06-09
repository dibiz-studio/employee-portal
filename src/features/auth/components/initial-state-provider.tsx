"use client";

import { useRef } from "react";

import { useAuthStore, type Profile } from "@/shared/stores/auth-store";

interface InitialStateProviderProps {
  profile: Profile;
  children: React.ReactNode;
}

/**
 * Synchronously hydrates the Zustand auth store with the server-fetched profile
 * before any child renders — prevents empty sidebar on first paint.
 */
export function InitialStateProvider({
  profile,
  children,
}: InitialStateProviderProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAuthStore.setState({ profile, isLoading: false });
    initialized.current = true;
  }

  return <>{children}</>;
}
