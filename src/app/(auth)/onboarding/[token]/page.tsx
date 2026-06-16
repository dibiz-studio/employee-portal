"use client";

import { use, useEffect, useState } from "react";

import { OnboardingInviteCard } from "@/features/onboarding/components/onboarding-invite-card";
import { fetchInvite } from "@/features/onboarding/services/onboarding.service";
import type { OnboardingInvite } from "@/features/onboarding/types";


export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [invite, setInvite] = useState<OnboardingInvite | null>(null);
  const [status, setStatus] = useState<"active" | "expired" | "revoked" | "used" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setInvite(null);
      setStatus(null);
      setError(null);
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
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {invite ? (
        <OnboardingInviteCard token={token} invite={invite} status={status ?? "active"} />
      ) : isLoading ? (
        <div className="mx-auto flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-11 animate-pulse rounded-md bg-muted" />
            <div className="h-11 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full rounded-xl border border-border bg-card p-8 shadow-sm">
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
  );
}
