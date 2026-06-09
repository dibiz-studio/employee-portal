"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createKpiTemplate } from "@/features/kpi/actions/kpi-actions";
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
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  measurement_unit: z.string().min(1, "Unit is required"),
  default_target: z.coerce.number().optional(),
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  department_id: z.string().optional(),
  weight: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof schema>;

interface CreateTemplateFormProps {
  departments: { id: string; name: string; code: string }[];
}

export function CreateTemplateForm({ departments }: CreateTemplateFormProps) {
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
      measurement_unit: "percentage",
      period: "MONTHLY",
      weight: 1,
    },
  });

  const period = watch("period");
  const departmentId = watch("department_id");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createKpiTemplate(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Template created");
      router.push("/kpi/templates");
      router.refresh();
    } catch {
      toast.error("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard
      allowed={["SUPER_ADMIN", "HR"]}
      fallback={
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage KPI templates.
        </p>
      }
    >
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template details</CardTitle>
          <CardDescription>
            Reusable KPI template for assigning to employees
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="e.g. Sales" {...register("category")} />
            {errors.category ? (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="measurement_unit">Measurement unit</Label>
            <Input id="measurement_unit" {...register("measurement_unit")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_target">Default target</Label>
            <Input
              id="default_target"
              type="number"
              step="0.01"
              {...register("default_target")}
            />
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
            <Label>Department (optional)</Label>
            <Select
              value={departmentId ?? ""}
              onValueChange={(v) => setValue("department_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create template"}
        </Button>
      </div>
    </form>
    </RoleGuard>
  );
}
