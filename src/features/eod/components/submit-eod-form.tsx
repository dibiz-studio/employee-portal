"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { createClient } from "@/shared/lib/supabase/client";

const eodSchema = z.object({
  report_date: z.string().min(1, "Date is required"),
  hours_worked: z.coerce.number().min(0.5).max(24),
  tasks: z
    .array(z.object({ value: z.string().min(1, "Task cannot be empty") }))
    .min(1, "Add at least one task"),
  blockers: z.string().optional(),
  tomorrow_plan: z.string().optional(),
});

type EodFormValues = z.infer<typeof eodSchema>;

interface SubmitEodFormProps {
  employeeId: string;
  defaultDate?: string;
  existingId?: string;
}

export function SubmitEodForm({
  employeeId,
  defaultDate,
  existingId,
}: SubmitEodFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = defaultDate ?? new Date().toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EodFormValues>({
    resolver: zodResolver(eodSchema),
    defaultValues: {
      report_date: today,
      hours_worked: 8,
      tasks: [{ value: "" }],
      blockers: "",
      tomorrow_plan: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const onSubmit = async (values: EodFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        employee_id: employeeId,
        report_date: values.report_date,
        tasks_completed: values.tasks.map((t) => t.value),
        hours_worked: values.hours_worked,
        blockers: values.blockers || null,
        tomorrow_plan: values.tomorrow_plan || null,
      };

      const { error } = existingId
        ? await supabase
            .from("daily_updates")
            .update(payload)
            .eq("id", existingId)
        : await supabase.from("daily_updates").insert(payload);

      if (error) throw error;
      toast.success(existingId ? "EOD updated" : "EOD submitted");
      router.push("/eod/history");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit EOD",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Update</CardTitle>
        <CardDescription>
          Record your completed tasks and plans for tomorrow.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="report_date">Report Date</Label>
              <Input
                id="report_date"
                type="date"
                {...register("report_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours_worked">Hours Worked</Label>
              <Input
                id="hours_worked"
                type="number"
                step="0.5"
                {...register("hours_worked")}
              />
              {errors.hours_worked ? (
                <p className="text-sm text-destructive">
                  {errors.hours_worked.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tasks Completed</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  placeholder={`Task ${index + 1}`}
                  {...register(`tasks.${index}.value`)}
                />
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            {errors.tasks ? (
              <p className="text-sm text-destructive">
                {errors.tasks.message ?? errors.tasks.root?.message}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockers">Blockers</Label>
            <Textarea id="blockers" rows={2} {...register("blockers")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tomorrow_plan">Tomorrow&apos;s Plan</Label>
            <Textarea
              id="tomorrow_plan"
              rows={2}
              {...register("tomorrow_plan")}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : existingId ? "Update" : "Submit"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
