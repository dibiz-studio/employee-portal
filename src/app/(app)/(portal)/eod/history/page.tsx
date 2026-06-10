import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getEodHistory } from "@/features/eod/services/eod.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { PageHeader } from "@/shared/components/data/page-header";
import { SectionNav } from "@/shared/components/layout/section-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/utils";

const EOD_NAV = [
  { label: "Overview", href: "/eod" },
  { label: "Submit", href: "/eod/submit" },
  { label: "History", href: "/eod/history" },
];

export default async function EodHistoryPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const updates = await getEodHistory(profile.id, profile.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="EOD History"
        description="Your past daily update submissions."
      />
      <SectionNav items={EOD_NAV} />

      {updates.length === 0 ? (
        <EmptyState
          title="No EOD history"
          description="Submit your first daily update to get started."
        />
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {formatDate(update.report_date)} · {update.hours_worked} hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Tasks completed</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {update.tasks_completed.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
                {update.blockers ? (
                  <p>
                    <span className="font-medium">Blockers:</span>{" "}
                    {update.blockers}
                  </p>
                ) : null}
                {update.tomorrow_plan ? (
                  <p>
                    <span className="font-medium">Tomorrow:</span>{" "}
                    {update.tomorrow_plan}
                  </p>
                ) : null}
                {update.manager_comment ? (
                  <p className="rounded-md bg-muted p-2">
                    <span className="font-medium">Manager:</span>{" "}
                    {update.manager_comment}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
