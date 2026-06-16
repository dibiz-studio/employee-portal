"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { createClient } from "@/shared/lib/supabase/client";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
  industry: z.string().optional(),
  website_url: z.string().url("Enter a valid website URL").optional().or(z.literal("")),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BrandForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
  });

  const onSubmit = async (values: BrandFormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("brands").insert({
        name: values.name,
        slug: toSlug(values.name),
        industry: values.industry || null,
        website_url: values.website_url || null,
        description: values.description || null,
        notes: values.notes || null,
      });

      if (error) throw error;

      toast.success("Brand created");
      router.push("/eod/brands");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create brand");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Brand</CardTitle>
        <CardDescription>
          Register a client brand so EOD submissions can be tied to real client work.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand name</Label>
            <Input id="name" placeholder="Acme Studio" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" placeholder="Beauty, SaaS, FMCG" {...register("industry")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              {...register("website_url")}
            />
            {errors.website_url ? (
              <p className="text-sm text-destructive">{errors.website_url.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="Brand context, tone, or campaign notes" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea id="notes" rows={3} placeholder="Team owner, deliverables, remarks" {...register("notes")} />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Create Brand"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
