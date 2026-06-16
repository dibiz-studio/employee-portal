import Link from "next/link";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getAllBrands } from "@/features/brands/services/brands.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { StatCard } from "@/shared/components/data/stat-card";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/data/empty-state";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { formatDateTime } from "@/shared/lib/utils";

export default async function BrandsPage() {
  const profile = await getServerProfile();
  if (!profile) return null;
  if (profile.role !== "SUPER_ADMIN" && profile.role !== "HR") return null;

  const brands = await getAllBrands();
  const nav = getEodNavItems(profile.role);
  const activeBrands = brands.filter((brand) => brand.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Client accounts used across EOD, campaigns, and project tracking."
        backHref="/eod"
        backLabel="Back to EOD"
        actions={
          <Button asChild>
            <Link href="/eod/brands/new">Add Brand</Link>
          </Button>
        }
      />
      <SectionNav items={nav} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Brands" value={brands.length} />
        <StatCard title="Active Brands" value={activeBrands.length} />
        <StatCard title="Paused / Archived" value={brands.length - activeBrands.length} />
      </div>

      {brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Add the first client brand so EOD submissions can be organized properly."
          actionLabel="Add Brand"
          actionHref="/eod/brands/new"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{brand.name}</CardTitle>
                    {brand.industry ? (
                      <p className="text-sm text-muted-foreground">{brand.industry}</p>
                    ) : null}
                  </div>
                  <Badge variant={brand.status === "ACTIVE" ? "success" : "secondary"}>
                    {brand.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {brand.description ? (
                  <p className="text-muted-foreground">{brand.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">EOD: {brand.eod_count}</Badge>
                  {brand.latest_update_at ? (
                    <Badge variant="outline">
                      Last update {formatDateTime(brand.latest_update_at)}
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-1 text-muted-foreground">
                  {brand.website_url ? <p>{brand.website_url}</p> : null}
                  {brand.notes ? <p>{brand.notes}</p> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
