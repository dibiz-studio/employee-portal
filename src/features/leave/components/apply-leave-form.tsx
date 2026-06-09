"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Textarea } from "@/shared/components/ui/textarea";
import { createClient } from "@/shared/lib/supabase/client";

const applyLeaveSchema = z
  .object({
    policy_id: z.string().min(1, "Select a leave policy"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return parseISO(data.end_date) >= parseISO(data.start_date);
    },
    { message: "End date must be on or after start date", path: ["end_date"] },
  );

type ApplyLeaveValues = z.infer<typeof applyLeaveSchema>;

interface PolicyOption {
  policy_id: string;
  policy_name: string;
  remaining_days: number;
}

interface ApplyLeaveFormProps {
  employeeId: string;
  policies: PolicyOption[];
}

export function ApplyLeaveForm({ employeeId, policies }: ApplyLeaveFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyLeaveValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: { policy_id: "", start_date: "", end_date: "", reason: "" },
  });

  const policyId = watch("policy_id");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const selectedPolicy = policies.find((p) => p.policy_id === policyId);
  const daysRequested = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
  }, [startDate, endDate]);

  const onSubmit = async (values: ApplyLeaveValues) => {
    if (selectedPolicy && daysRequested > selectedPolicy.remaining_days) {
      toast.error("Insufficient leave balance");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("leave_requests").insert({
        employee_id: employeeId,
        policy_id: values.policy_id,
        start_date: values.start_date,
        end_date: values.end_date,
        days_requested: daysRequested,
        reason: values.reason,
        status: "PENDING",
      });

      if (error) throw error;
      toast.success("Leave request submitted");
      router.push("/leave/history");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit leave",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Application</CardTitle>
        <CardDescription>
          Submit a new leave request for manager approval.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Leave Policy</Label>
            <Select
              value={policyId}
              onValueChange={(value) => setValue("policy_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.policy_id} value={policy.policy_id}>
                    {policy.policy_name} ({policy.remaining_days} days left)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.policy_id ? (
              <p className="text-sm text-destructive">
                {errors.policy_id.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date ? (
                <p className="text-sm text-destructive">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date ? (
                <p className="text-sm text-destructive">
                  {errors.end_date.message}
                </p>
              ) : null}
            </div>
          </div>

          {daysRequested > 0 ? (
            <p className="text-sm text-muted-foreground">
              Days requested: <strong>{daysRequested}</strong>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              rows={4}
              placeholder="Describe the reason for your leave..."
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting || policies.length === 0}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
