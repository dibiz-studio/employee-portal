import { redirect } from "next/navigation";
import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getArchivedMonths } from "@/features/eod/services/eod.service";
import { getEodNavItems } from "@/features/eod/lib/eod-nav";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";
import { EodArchiveSection } from "@/features/eod/components/eod-archive-section";

export default async function EodArchivePage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  if (profile.role !== "HR" && profile.role !== "SUPER_ADMIN") {
    redirect("/eod");
  }

  const nav = getEodNavItems(profile.role);
  const archivedMonths = await getArchivedMonths(profile.role, profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="EOD Archive"
        description="View and export past End of Day submissions for all employees."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />
      <SectionNav items={nav} />

      <div className="space-y-4">
        {archivedMonths.length === 0 ? (
          <p className="text-sm text-muted-foreground">No archived months found.</p>
        ) : (
          archivedMonths.map((m) => (
            <EodArchiveSection
              key={`${m.year}-${m.month}`}
              year={m.year}
              month={m.month}
              role={profile.role}
            />
          ))
        )}
      </div>
    </div>
  );
}
