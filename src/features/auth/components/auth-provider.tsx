"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";

import {
  fetchProfile,
  syncGoogleAvatar,
} from "@/features/auth/services/auth.service";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/stores/auth-store";

interface AuthContextValue {
  signOut: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

async function handleUserSession(
  user: { id: string; user_metadata?: Record<string, unknown> },
  setProfile: (profile: ReturnType<typeof useAuthStore.getState>["profile"]) => void,
) {
  const googleAvatar = user.user_metadata?.picture as string | undefined;
  if (googleAvatar) {
    await syncGoogleAvatar(user.id, googleAvatar);
  }

  const profile = await fetchProfile(user.id);
  setProfile(profile);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const supabase = createClient();

    const syncSession = async () => {
      const existing = useAuthStore.getState().profile;

      if (!existing) {
        setLoading(true);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          clearAuth();
          return;
        }

        if (existing?.id === user.id) {
          setLoading(false);
          return;
        }

        await handleUserSession(user, setProfile);
      } catch {
        clearAuth();
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        clearAuth();
        if (event === "SIGNED_OUT") {
          toast.error("Session expired. Please sign in again.");
          router.push("/login");
        }
        return;
      }

      try {
        await handleUserSession(session.user, setProfile);
      } catch {
        toast.error("Failed to load profile");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearAuth, router, setLoading, setProfile]);

  const value = useMemo(
    () => ({
      signOut: async (redirectTo = "/login") => {
        clearAuth();

        const logoutUrl = `/logout?redirect=${encodeURIComponent(redirectTo)}`;

        if (typeof window !== "undefined") {
          window.location.replace(logoutUrl);
          return;
        }

        router.replace(logoutUrl);
        router.refresh();
      },
    }),
    [clearAuth, router],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
