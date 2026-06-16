"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Link2, Loader2, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createOnboardingInviteAction } from "@/features/onboarding/actions/onboarding.actions";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/shared/types/roles";

type ManagerOption = {
  id: string;
  full_name: string;
  role: AppRole;
};

const inviteSchema = z.object({
  invitee_full_name: z.string().min(2, "Full name is required"),
  invitee_email: z.string().email("Enter a valid email"),
  target_role: z.enum(["HR", "MANAGER", "EMPLOYEE", "INTERN"]),
  assigned_manager_id: z.string().optional(),
  estimated_stipend: z.string().optional(),
  joining_letter_drive_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface OnboardingInviteFormProps {
  managers: ManagerOption[];
}

export function OnboardingInviteForm({ managers }: OnboardingInviteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const roles = useMemo(
    () => APP_ROLES.filter((role) => role !== "SUPER_ADMIN"),
    [],
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invitee_full_name: "",
      invitee_email: "",
      target_role: "EMPLOYEE",
      assigned_manager_id: "",
      estimated_stipend: "",
      joining_letter_drive_url: "",
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createOnboardingInviteAction({
        invitee_full_name: values.invitee_full_name.trim(),
        invitee_email: values.invitee_email.trim().toLowerCase(),
        target_role: values.target_role,
        assigned_manager_id: values.assigned_manager_id || null,
        estimated_stipend: values.estimated_stipend?.trim()
          ? Number(values.estimated_stipend)
          : null,
        joining_letter_drive_url: values.joining_letter_drive_url?.trim() || null,
      });

      if (result.error) throw new Error(result.error);

      setInviteLink(result.inviteUrl ?? null);
      setExpiresAt(result.expiresAt ?? null);
      toast.success("Onboarding invite created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${inviteLink}`,
    );
    toast.success("Invite link copied");
  };

  const inviteUrl = inviteLink ? `${origin}${inviteLink}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Onboarding Invite</CardTitle>
        <CardDescription>
          Send a secure 24-hour onboarding link to a new joiner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invitee_full_name">Full name</Label>
              <Input id="invitee_full_name" {...register("invitee_full_name")} />
              {errors.invitee_full_name ? (
                <p className="text-sm text-destructive">{errors.invitee_full_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitee_email">Email</Label>
              <Input id="invitee_email" type="email" {...register("invitee_email")} />
              {errors.invitee_email ? (
                <p className="text-sm text-destructive">{errors.invitee_email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={watch("target_role")}
                onValueChange={(value) => setValue("target_role", value as InviteFormValues["target_role"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned manager</Label>
              <Select
                value={watch("assigned_manager_id") || "__none"}
                onValueChange={(value) =>
                  setValue("assigned_manager_id", value === "__none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name} ({ROLE_LABELS[manager.role]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimated_stipend">Estimated stipend</Label>
              <Input
                id="estimated_stipend"
                type="number"
                step="0.01"
                placeholder="42000"
                {...register("estimated_stipend")}
              />
              {errors.estimated_stipend ? (
                <p className="text-sm text-destructive">
                  {errors.estimated_stipend.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining_letter_drive_url">Joining Letter (Drive Link)</Label>
              <Input
                id="joining_letter_drive_url"
                type="url"
                placeholder="https://drive.google.com/..."
                {...register("joining_letter_drive_url")}
              />
              {errors.joining_letter_drive_url ? (
                <p className="text-sm text-destructive">
                  {errors.joining_letter_drive_url.message}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create invite
              </>
            )}
          </Button>
        </form>

        {inviteLink ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Invite ready</p>
              <p className="text-sm text-muted-foreground">
                Share this link with the new joiner. It expires in 24 hours.
              </p>
              {expiresAt ? (
                <p className="text-xs text-muted-foreground">
                  Expires at {new Date(expiresAt).toLocaleString("en-IN")}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{inviteUrl}</span>
                </div>
              </div>
              <Button type="button" variant="outline" className="shrink-0" onClick={() => void copyInvite()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
