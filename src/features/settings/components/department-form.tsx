"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createDepartment } from "@/features/settings/actions/department-actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be 10 characters or less")
    .regex(/^[A-Za-z0-9_-]+$/, "Code can only contain letters, numbers, - and _"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function DepartmentForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createDepartment(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Department created");
      reset();
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create department</DialogTitle>
          <DialogDescription>
            Add a new department to your organization structure.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Name</Label>
            <Input
              id="dept-name"
              placeholder="Engineering"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-code">Code</Label>
            <Input
              id="dept-code"
              placeholder="ENG"
              {...register("code")}
            />
            {errors.code ? (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-desc">Description (optional)</Label>
            <Textarea
              id="dept-desc"
              placeholder="Software and product engineering"
              {...register("description")}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
