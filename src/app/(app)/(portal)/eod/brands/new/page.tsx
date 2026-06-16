import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { BrandForm } from "@/features/brands/components/brand-form";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

export default async function NewBrandPage() {
  const profile = await getServerProfile();
  if (!profile) return null;
  if (profile.role !== "SUPER_ADMIN" && profile.role !== "HR") return null;

  const nav = getEodNavItems(profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Brand"
        description="Register a client brand for EOD and project tracking."
        backHref="/eod/brands"
        backLabel="Back to Brands"
      />
      <SectionNav items={nav} />
      <BrandForm />
    </div>
  );
}
