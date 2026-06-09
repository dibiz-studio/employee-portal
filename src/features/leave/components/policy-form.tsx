"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { LeavePolicyRow } from "@/features/leave/services/leave.service";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { createClient } from "@/shared/lib/supabase/client";

const policySchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  description: z.string().optional(),
  days_per_year: z.coerce.number().min(0),
  min_notice_days: z.coerce.number().min(0),
  max_consecutive_days: z.coerce.number().optional().nullable(),
  carry_forward_limit: z.coerce.number().optional().nullable(),
  is_paid: z.boolean(),
  requires_approval: z.boolean(),
  carry_forward: z.boolean(),
  is_active: z.boolean(),
});

type PolicyFormValues = z.infer<typeof policySchema>;

interface PolicyFormProps {
  policy: LeavePolicyRow;
}

export function PolicyForm({ policy }: PolicyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: policy.name,
      code: policy.code,
      description: policy.description ?? "",
      days_per_year: policy.days_per_year,
      min_notice_days: policy.min_notice_days,
      max_consecutive_days: policy.max_consecutive_days,
      carry_forward_limit: policy.carry_forward_limit,
      is_paid: policy.is_paid,
      requires_approval: policy.requires_approval,
      carry_forward: policy.carry_forward,
      is_active: policy.is_active,
    },
  });

  const onSubmit = async (values: PolicyFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("leave_policies")
        .update({
          name: values.name,
          code: values.code,
          description: values.description || null,
          days_per_year: values.days_per_year,
          min_notice_days: values.min_notice_days,
          max_consecutive_days: values.max_consecutive_days || null,
          carry_forward_limit: values.carry_forward_limit || null,
          is_paid: values.is_paid,
          requires_approval: values.requires_approval,
          carry_forward: values.carry_forward,
          is_active: values.is_active,
        })
        .eq("id", policy.id);

      if (error) throw error;
      toast.success("Policy updated");
      router.push("/leave/policies");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update policy",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Policy</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" {...register("code")} />
              {errors.code ? (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="days_per_year">Days per Year</Label>
              <Input
                id="days_per_year"
                type="number"
                step="0.5"
                {...register("days_per_year")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_notice_days">Min Notice Days</Label>
              <Input
                id="min_notice_days"
                type="number"
                {...register("min_notice_days")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_consecutive_days">Max Consecutive</Label>
              <Input
                id="max_consecutive_days"
                type="number"
                {...register("max_consecutive_days")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_paid")} />
              Paid leave
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("requires_approval")} />
              Requires approval
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("carry_forward")} />
              Carry forward
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_active")} />
              Active
            </label>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Policy"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
