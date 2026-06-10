"use client";

import { useEffect, useState } from "react";

import { OnboardingInviteCard } from "@/features/onboarding/components/onboarding-invite-card";
import { fetchInvite } from "@/features/onboarding/services/onboarding.service";
import type { OnboardingInvite } from "@/features/onboarding/types";
import { Logo } from "@/shared/components/logo";
import { APP_TAGLINE } from "@/shared/lib/constants";

export default function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [invite, setInvite] = useState<OnboardingInvite | null>(null);
  const [status, setStatus] = useState<"active" | "expired" | "revoked" | "used" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetchInvite(token);
        if (!active) return;
        setInvite(response.invite);
        setStatus(response.status);
      } catch (loadError) {
        if (!active) return;
        const message =
          loadError instanceof Error ? loadError.message : "Invite not found";
        setError(message);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.15),_transparent_35%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)] p-4">
      <div className="absolute left-8 top-8">
        <Logo showSubtitle />
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>

      <div className="w-full pt-24">
        {invite ? (
          <OnboardingInviteCard token={token} invite={invite} status={status ?? "active"} />
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Dibiz Studio onboarding
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Invite not found</h1>
            <p className="mt-3 text-muted-foreground">
              {error ?? "This onboarding link is invalid or has expired. Please ask HR for a new invite."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
