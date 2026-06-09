import { create } from "zustand";

import type { AppRole } from "@/shared/types/roles";

export type OnboardingStatus = "PENDING" | "COMPLETED";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: AppRole;
  phone: string | null;
  is_active: boolean;
  onboarding_status?: OnboardingStatus;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ profile: null, isLoading: false }),
}));
