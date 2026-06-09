"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { assignKpi } from "@/features/kpi/actions/kpi-actions";
import type { KpiTemplate } from "@/features/kpi/types";
import { RoleGuard } from "@/shared/components/guards/role-guard";
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

const schema = z.object({
  employee_id: z.string().min(1, "Select an employee"),
  template_id: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  target_value: z.coerce.number().positive("Target must be positive"),
  unit: z.string().min(1, "Unit is required"),
  weight: z.coerce.number().min(0.1),
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  period_start: z.string().min(1),
  period_end: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface AssignableEmployee {
  profile_id: string;
  employee_code: string;
  job_title: string;
  profile: { id: string; full_name: string; email: string } | null;
}

interface AssignKpiFormProps {
  employees: AssignableEmployee[];
  templates: KpiTemplate[];
}

export function AssignKpiForm({ employees, templates }: AssignKpiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "percentage",
      period: "MONTHLY",
      weight: 1,
      period_start: new Date().toISOString().split("T")[0],
      period_end: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      )
        .toISOString()
        .split("T")[0],
    },
  });

  const employeeId = watch("employee_id");
  const templateId = watch("template_id");
  const period = watch("period");

  useEffect(() => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setValue("title", template.name);
    setValue("unit", template.measurement_unit);
    setValue("period", template.period);
    if (template.default_target) {
      setValue("target_value", template.default_target);
    }
    setValue("weight", template.weight);
    if (template.description) {
      setValue("description", template.description);
    }
  }, [templateId, templates, setValue]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await assignKpi(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("KPI assigned successfully");
      router.push("/kpi");
      router.refresh();
    } catch {
      toast.error("Failed to assign KPI");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard
      allowed={["SUPER_ADMIN", "HR", "MANAGER"]}
      fallback={
        <p className="text-sm text-muted-foreground">
          You do not have permission to assign KPIs.
        </p>
      }
    >
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign KPI</CardTitle>
          <CardDescription>
            Set performance targets for an employee
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Employee</Label>
            <Select
              value={employeeId ?? ""}
              onValueChange={(v) => setValue("employee_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.profile_id} value={emp.profile_id}>
                    {emp.profile?.full_name ?? emp.employee_code} — {emp.job_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id ? (
              <p className="text-sm text-destructive">
                {errors.employee_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Template (optional)</Label>
            <Select
              value={templateId ?? ""}
              onValueChange={(v) => setValue("template_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Start from template or custom" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value">Target value</Label>
            <Input
              id="target_value"
              type="number"
              step="0.01"
              {...register("target_value")}
            />
            {errors.target_value ? (
              <p className="text-sm text-destructive">
                {errors.target_value.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" {...register("unit")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" type="number" step="0.1" {...register("weight")} />
          </div>

          <div className="space-y-2">
            <Label>Period</Label>
            <Select
              value={period}
              onValueChange={(v) => setValue("period", v as FormValues["period"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_start">Period start</Label>
            <Input id="period_start" type="date" {...register("period_start")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_end">Period end</Label>
            <Input id="period_end" type="date" {...register("period_end")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Assigning..." : "Assign KPI"}
        </Button>
      </div>
    </form>
    </RoleGuard>
  );
}
