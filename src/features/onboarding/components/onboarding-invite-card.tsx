"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { signInWithGoogle } from "@/features/auth/services/auth.service";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

import type { OnboardingInvite } from "../types";

export function OnboardingInviteCard({
  token,
  invite,
  status,
}: {
  token: string;
  invite: OnboardingInvite;
  status: "active" | "expired" | "revoked" | "used";
}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(
        `${window.location.origin}/auth/callback?invite=${encodeURIComponent(token)}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(message);
      setIsGoogleLoading(false);
    }
  };

  const expiredAt = new Date(invite.expires_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className="w-full max-w-2xl overflow-hidden border-border bg-card shadow-sm">
      <div className="h-2 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500" />
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Invite active" : status}
          </Badge>
          <Badge variant="outline">{invite.target_role}</Badge>
        </div>
        <CardTitle className="text-2xl">
          Welcome, {invite.invitee_full_name ?? invite.invitee_email}
        </CardTitle>
        <CardDescription className="max-w-xl">
          This is the Dibiz Studio onboarding link for{" "}
          <strong>{invite.invitee_email}</strong>. The invite expires on{" "}
          <strong>{expiredAt}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Manager
            </p>
            <p className="mt-1 text-sm font-medium">
              {(invite.metadata.manager_name as string | undefined) ??
                "Assigned by HR"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Stipend
            </p>
            <p className="mt-1 text-sm font-medium">
              {invite.estimated_stipend
                ? `INR ${invite.estimated_stipend.toLocaleString("en-IN")}`
                : "Not disclosed"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={() => void handleGoogleSignIn()} disabled={isGoogleLoading}>
            {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
          <Button asChild variant="outline">
            <Link href={`/signup?invite=${encodeURIComponent(token)}`}>
              Set password instead
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href={`/login?invite=${encodeURIComponent(token)}`}
          >
            Sign in
          </Link>
          {" "}and continue the onboarding flow.
        </p>
      </CardContent>
    </Card>
  );
}
