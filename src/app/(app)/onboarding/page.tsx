"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/features/auth/components/auth-provider";
import { fetchProfile } from "@/features/auth/services/auth.service";
import { Logo } from "@/shared/components/logo";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useAuthStore } from "@/shared/stores/auth-store";

export default function OnboardingPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    if (profile?.onboarding_status === "COMPLETED") {
      router.replace("/dashboard");
    }
  }, [profile?.onboarding_status, router]);

  // Poll for approval every 5 seconds
  useEffect(() => {
    if (!profile?.id) return;

    const checkApproval = async () => {
      const fresh = await fetchProfile(profile.id);
      if (fresh?.onboarding_status === "COMPLETED") {
        setProfile(fresh);
        router.replace("/dashboard");
      }
    };

    const interval = setInterval(() => {
      void checkApproval();
    }, 5000);

    return () => clearInterval(interval);
  }, [profile?.id, router, setProfile]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <Button variant="outline" onClick={() => void handleSignOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      <Logo className="mb-8" />
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Dibiz Studio!</CardTitle>
          <CardDescription>
            Your account is pending HR approval. You will be redirected
            automatically once your role is assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
            role="status"
            aria-label="Waiting for approval"
          />
          <p className="text-center text-sm text-muted-foreground">
            Signed in as <strong>{profile?.email ?? "…"}</strong>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Checking for approval every few seconds…
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button variant="ghost" onClick={() => void handleSignOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out and use a different account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
