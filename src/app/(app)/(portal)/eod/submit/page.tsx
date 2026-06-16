import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getActiveBrands } from "@/features/brands/services/brands.service";
import { SubmitEodForm } from "@/features/eod/components/submit-eod-form";
import { getEodByDate } from "@/features/eod/services/eod.service";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Button } from "@/shared/components/ui/button";
import { getLocalDateString } from "@/shared/lib/utils";
import Link from "next/link";

export default async function SubmitEodPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const today = getLocalDateString();
  const [existing, brands] = await Promise.all([
    getEodByDate(profile.id, today),
    getActiveBrands(),
  ]);
  const nav = getEodNavItems(profile.role);
  const canManageBrands = profile.role === "SUPER_ADMIN" || profile.role === "HR";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit EOD"
        description={
          existing
            ? "You already submitted today. Update your entry below."
            : "Record your daily work update."
        }
      />
      <SectionNav items={nav} />
      {brands.length === 0 ? (
        <EmptyState
          title="No brands configured yet"
          description={
            canManageBrands
              ? "Create the first client brand, then return here to tag your EOD submissions."
              : "HR/Admin still needs to add a brand before you can tag this EOD."
          }
          actionLabel={canManageBrands ? "Add Brand" : "View Brands"}
          actionHref={canManageBrands ? "/eod/brands/new" : "/eod/brands"}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          Need to create or manage brands?{" "}
          <Link href="/eod/brands" className="font-medium text-orange-300 underline-offset-4 hover:underline">
            Open the Brands section
          </Link>
          {canManageBrands ? " or add a new one right now." : "."}
        </p>
        {canManageBrands ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/eod/brands/new">Add Brand</Link>
          </Button>
        ) : null}
      </div>
      <SubmitEodForm
        employeeId={profile.id}
        defaultDate={today}
        existingId={existing?.id}
        brands={brands}
      />
    </div>
  );
}
