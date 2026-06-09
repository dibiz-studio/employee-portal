import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { SubmitEodForm } from "@/features/eod/components/submit-eod-form";
import { getEodByDate } from "@/features/eod/services/eod.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";

const EOD_NAV = [
  { label: "Dashboard", href: "/eod" },
  { label: "Submit", href: "/eod/submit" },
  { label: "History", href: "/eod/history" },
];

export default async function SubmitEodPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const today = new Date().toISOString().split("T")[0];
  const existing = await getEodByDate(profile.id, today);

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
      <SectionNav items={EOD_NAV} />
      <SubmitEodForm
        employeeId={profile.id}
        defaultDate={today}
        existingId={existing?.id}
      />
    </div>
  );
}
