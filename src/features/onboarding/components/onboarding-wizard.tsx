"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Loader2, LogOut, Send } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { fetchProfile } from "@/features/auth/services/auth.service";
import {
  fetchInvite,
  fetchOnboardingIntake,
  saveOnboardingDraft,
  submitOnboardingIntake,
} from "@/features/onboarding/services/onboarding.service";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";

import { useAuthStore } from "@/shared/stores/auth-store";

const STEP_TITLES = [
  "Welcome",
  "Identity",
  "Documents",
  "Review",
];

const INITIAL_FORM = {
  fullPan: "",
  fullAadhaar: "",
  panDriveUrl: "",
  aadhaarDriveUrl: "",
  signedJoiningLetterUrl: "",
};

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { signOut } = useAuth();
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [invite, setInvite] = useState<Awaited<ReturnType<typeof fetchInvite>>["invite"] | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"active" | "expired" | "revoked" | "used" | null>(null);
  const [intakeStatus, setIntakeStatus] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(Boolean(inviteToken));
  const [loadingIntake, setLoadingIntake] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const redirectToDashboard = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (profile?.onboarding_status === "COMPLETED") {
      redirectToDashboard();
    }
  }, [profile?.onboarding_status, redirectToDashboard]);

  useEffect(() => {
    if (!profile?.id) return;

    const checkApproval = async () => {
      const fresh = await fetchProfile(profile.id);
      if (fresh?.onboarding_status === "COMPLETED") {
        setProfile(fresh);
        redirectToDashboard();
      }
    };

    const interval = setInterval(() => {
      void checkApproval();
    }, 5000);

    return () => clearInterval(interval);
  }, [profile?.id, redirectToDashboard, setProfile]);

  useEffect(() => {
    if (!inviteToken) {
      setLoadingInvite(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoadingInvite(true);
      setLoadError(null);
      try {
        const result = await fetchInvite(inviteToken);
        if (!active) return;
        setInvite(result.invite);
        setInviteStatus(result.status);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Unable to load invite";
        setLoadError(message);
      } finally {
        if (active) setLoadingInvite(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [inviteToken]);

  useEffect(() => {
    if (!invite || !profile?.id) return;

    let active = true;

    const load = async () => {
      setLoadingIntake(true);
      try {
        const existing = await fetchOnboardingIntake(profile.id, invite.id);
        if (!active || !existing) return;

        setIntakeStatus(existing.status);
        setStep(Math.min(existing.current_step || 1, 4));
        setForm({
          fullPan: existing.full_pan ?? "",
          fullAadhaar: existing.full_aadhaar ?? "",
          panDriveUrl: existing.pan_drive_url ?? "",
          aadhaarDriveUrl: existing.aadhaar_drive_url ?? "",
          signedJoiningLetterUrl: (existing.metadata?.signed_joining_letter_drive_url as string) ?? "",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load onboarding";
        toast.error(message);
      } finally {
        if (active) setLoadingIntake(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [invite, profile?.id]);

  const progress = useMemo(() => (step / STEP_TITLES.length) * 100, [step]);
  const isWaitingForReview =
    intakeStatus != null && intakeStatus !== "DRAFT" && intakeStatus !== "NEEDS_CHANGES";
  const inviteInactive =
    Boolean(inviteToken) && Boolean(loadError || inviteStatus === "expired" || inviteStatus === "revoked" || inviteStatus === "used");

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const persistDraft = async (nextStep: number) => {
    if (!profile?.id || !invite?.id) return;
    setIsSaving(true);
    try {
      await saveOnboardingDraft({
        profileId: profile.id,
        inviteId: invite.id,
        draft: {
          current_step: nextStep,
          full_pan: form.fullPan || null,
          full_aadhaar: form.fullAadhaar || null,
          pan_drive_url: form.panDriveUrl || null,
          aadhaar_drive_url: form.aadhaarDriveUrl || null,
          signed_joining_letter_drive_url: form.signedJoiningLetterUrl || null,
          metadata: {
            source: "onboarding-wizard",
            invite_token: inviteToken,
          },
        },
      });
      setStep(nextStep);
      toast.success("Draft saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save draft";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id || !invite?.id) return;
    if (!form.fullPan || !form.fullAadhaar || !form.panDriveUrl || !form.aadhaarDriveUrl) {
      toast.error("Please complete all KYC fields before submitting.");
      return;
    }
    if (invite.joining_letter_file_path && !form.signedJoiningLetterUrl) {
      toast.error("Please provide a link to the signed joining letter.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitOnboardingIntake({
        profileId: profile.id,
        inviteId: invite.id,
        draft: {
          current_step: 4,
          full_pan: form.fullPan || null,
          full_aadhaar: form.fullAadhaar || null,
          pan_drive_url: form.panDriveUrl || null,
          aadhaar_drive_url: form.aadhaarDriveUrl || null,
          signed_joining_letter_drive_url: form.signedJoiningLetterUrl || null,
          metadata: {
            source: "onboarding-wizard",
            invite_token: inviteToken,
          },
        },
      });
      setIntakeStatus("SUBMITTED");
      toast.success("Onboarding submitted for review");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit onboarding";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut("/login");
  };

  if (!inviteToken) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Onboarding pending</CardTitle>
            <CardDescription>
              Your profile is still waiting for HR approval. We&apos;ll move you to the dashboard once onboarding is completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-center text-sm text-muted-foreground">
              Signed in as <strong>{profile?.email ?? "..."}</strong>
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button type="button" variant="ghost" onClick={() => void handleSignOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loadingInvite || loadingIntake) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-xl border-border bg-card">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Loading onboarding</CardTitle>
            <CardDescription>
              We&apos;re checking your invite and loading your saved progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteInactive || !invite || loadError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Invite unavailable</CardTitle>
            <CardDescription>
              {loadError ?? "This invite has expired, was revoked, or has already been used."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, contact HR and ask for a fresh onboarding link.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login">Go to login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-xl border-border bg-card">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Loading session</CardTitle>
            <CardDescription>
              We&apos;re syncing your profile before opening the onboarding wizard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Just a second...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWaitingForReview) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-border bg-card">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Submitted</Badge>
              <Badge variant="outline">HR review</Badge>
            </div>
            <CardTitle className="text-2xl">Your onboarding is under review</CardTitle>
            <CardDescription>
              We&apos;ve received your details. HR will review the submission and your access will unlock once approval is complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <Clock3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Keep this tab handy</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll redirect you to the dashboard automatically when the profile is approved.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Signed in as <strong>{profile?.email ?? "..."}</strong>
            </p>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => void handleSignOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
            <Button type="button" variant="outline" onClick={() => router.refresh()}>
              Refresh status
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{STEP_TITLES[step - 1]}</Badge>
            <Badge variant="outline">{invite.target_role}</Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Complete your onboarding</CardTitle>
            <CardDescription className="max-w-2xl">
              Finish these steps to confirm your identity and share the KYC details HR needs before your account is activated.
            </CardDescription>
          </div>
          <Progress value={progress} />
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {step === 1 ? (
              <section className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Invite summary
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold">
                      {invite.invitee_full_name ?? profile?.full_name ?? "Welcome"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invite.invitee_email}
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Manager
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {(invite.metadata.manager_name as string | undefined) ?? "Assigned by HR"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Stipend
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {invite.estimated_stipend
                          ? `INR ${invite.estimated_stipend.toLocaleString("en-IN")}`
                          : "Not shared"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-border p-5">
                  <p className="text-sm font-medium">What happens next</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>1. Confirm your identity details.</li>
                    <li>2. Share PAN / Aadhaar and document links.</li>
                    <li>3. Submit the intake for HR review.</li>
                  </ul>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">Full PAN</Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={form.fullPan}
                    onChange={(event) => updateField("fullPan", event.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Full Aadhaar</Label>
                  <Input
                    id="aadhaar"
                    placeholder="123412341234"
                    value={form.fullAadhaar}
                    onChange={(event) => updateField("fullAadhaar", event.target.value)}
                  />
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  We keep these values in the onboarding intake so HR can verify them before your profile is activated.
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="panUrl">PAN Drive link</Label>
                  <Input
                    id="panUrl"
                    placeholder="https://drive.google.com/..."
                    value={form.panDriveUrl}
                    onChange={(event) => updateField("panDriveUrl", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarUrl">Aadhaar Drive link</Label>
                  <Input
                    id="aadhaarUrl"
                    placeholder="https://drive.google.com/..."
                    value={form.aadhaarDriveUrl}
                    onChange={(event) => updateField("aadhaarDriveUrl", event.target.value)}
                  />
                </div>
                
                {invite?.joining_letter_file_path && (
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-700">
                    <p className="mb-2 font-medium">Joining Letter</p>
                    <p className="mb-3">HR has provided your joining letter. Please review, sign, and upload a copy to your Drive, then paste the link below.</p>
                    <Button variant="outline" size="sm" asChild className="bg-background">
                      <a href={invite.joining_letter_file_path} target="_blank" rel="noopener noreferrer">
                        View Joining Letter
                      </a>
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signedJoiningLetterUrl">Signed Joining Letter (Drive link)</Label>
                  <Input
                    id="signedJoiningLetterUrl"
                    placeholder="https://drive.google.com/..."
                    value={form.signedJoiningLetterUrl}
                    onChange={(event) => updateField("signedJoiningLetterUrl", event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Required if HR provided a joining letter above.</p>
                </div>
              </section>
            ) : null}

            {step === 4 ? (
              <section className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">PAN</p>
                      <p className="mt-1 text-sm font-medium">{form.fullPan || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Aadhaar</p>
                      <p className="mt-1 text-sm font-medium">{form.fullAadhaar || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">PAN doc</p>
                      <p className="mt-1 text-sm font-medium break-all">
                        {form.panDriveUrl || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Aadhaar doc</p>
                      <p className="mt-1 text-sm font-medium break-all">
                        {form.aadhaarDriveUrl || "Not provided"}
                      </p>
                    </div>
                    {form.signedJoiningLetterUrl && (
                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed Joining Letter</p>
                        <p className="mt-1 text-sm font-medium break-all">
                          {form.signedJoiningLetterUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700">
                  Review the details once more before submitting. HR will validate the KYC data and then activate your profile.
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-medium">{STEP_TITLES[step - 1]}</span>
                <span className="text-muted-foreground">{step} / 4</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tips</p>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  Keep PAN and Aadhaar exactly as printed.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  Paste the Drive links with access open to HR.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  You can save progress and continue later.
                </li>
              </ul>
            </div>
          </aside>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border px-6 py-5 md:flex-row md:items-center md:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleSignOut()}
            className="w-full md:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1 || isSaving || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => void persistDraft(step + 1)}
                disabled={isSaving || isSubmitting}
              >
                {isSaving ? "Saving..." : "Save & continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSaving || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit onboarding"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


