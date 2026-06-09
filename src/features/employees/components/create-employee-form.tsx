"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createEmployee } from "@/features/employees/actions/create-employee";
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
import { APP_ROLES, ROLE_LABELS } from "@/shared/types/roles";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name is required"),
  role: z.enum(["EMPLOYEE", "INTERN", "MANAGER", "HR"]),
  phone: z.string().optional(),
  employee_code: z.string().min(2, "Employee code is required"),
  department_id: z.string().optional(),
  job_title: z.string().min(2, "Job title is required"),
  hire_date: z.string().min(1, "Hire date is required"),
  work_location: z.string().optional(),
  employment_status: z.enum(["ACTIVE", "PROBATION"]),
});

type FormValues = z.infer<typeof schema>;

interface CreateEmployeeFormProps {
  departments: { id: string; name: string; code: string }[];
}

export function CreateEmployeeForm({ departments }: CreateEmployeeFormProps) {
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
      role: "EMPLOYEE",
      employment_status: "ACTIVE",
      hire_date: new Date().toISOString().split("T")[0],
    },
  });

  const role = watch("role");
  const employmentStatus = watch("employment_status");
  const departmentId = watch("department_id");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createEmployee(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Employee created successfully");
      router.push(`/employees/${result.profileId}`);
      router.refresh();
    } catch {
      toast.error("Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard
      allowed={["SUPER_ADMIN", "HR"]}
      fallback={
        <p className="text-sm text-muted-foreground">
          You do not have permission to create employees.
        </p>
      }
    >
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Login credentials for the new employee</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name ? (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as FormValues["role"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment</CardTitle>
          <CardDescription>HR profile details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employee_code">Employee code</Label>
            <Input id="employee_code" placeholder="EMP-001" {...register("employee_code")} />
            {errors.employee_code ? (
              <p className="text-sm text-destructive">
                {errors.employee_code.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Job title</Label>
            <Input id="job_title" {...register("job_title")} />
            {errors.job_title ? (
              <p className="text-sm text-destructive">{errors.job_title.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={departmentId ?? ""}
              onValueChange={(v) => setValue("department_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire date</Label>
            <Input id="hire_date" type="date" {...register("hire_date")} />
            {errors.hire_date ? (
              <p className="text-sm text-destructive">{errors.hire_date.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="work_location">Work location</Label>
            <Input id="work_location" {...register("work_location")} />
          </div>
          <div className="space-y-2">
            <Label>Employment status</Label>
            <Select
              value={employmentStatus}
              onValueChange={(v) =>
                setValue("employment_status", v as FormValues["employment_status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PROBATION">Probation</SelectItem>
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
          {isSubmitting ? "Creating..." : "Create employee"}
        </Button>
      </div>
    </form>
    </RoleGuard>
  );
}
