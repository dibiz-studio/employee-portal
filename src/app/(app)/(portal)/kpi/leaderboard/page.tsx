import Link from "next/link";
import { Medal, Trophy } from "lucide-react";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { getKpiLeaderboard } from "@/features/kpi/services/kpi.service";
import { PageHeader } from "@/shared/components/data/page-header";
import { EmptyState } from "@/shared/components/data/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-warning" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-warning/70" />;
  return <span className="w-4 text-center text-sm font-medium">{rank}</span>;
}

export default async function KpiLeaderboardPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const leaderboard = await getKpiLeaderboard(profile.role, profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Leaderboard"
        description="Top performers ranked by average KPI completion"
        backHref="/kpi"
        backLabel="Back to KPI dashboard"
      />

      {leaderboard.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No rankings yet"
          description="Leaderboard will populate once KPIs are assigned and tracked."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <Card
                key={entry.employeeId}
                className={index === 0 ? "border-warning/50 bg-warning/5" : undefined}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index + 1)}
                    <CardTitle className="text-base">#{index + 1}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={entry.avatarUrl ?? undefined}
                        alt={entry.fullName}
                      />
                      <AvatarFallback>{getInitials(entry.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entry.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.department}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Avg progress</span>
                      <span className="font-semibold">{entry.avgProgress}%</span>
                    </div>
                    <Progress value={entry.avgProgress} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.onTrackCount}/{entry.kpiCount} on track
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Full rankings</CardTitle>
              <CardDescription>
                All employees ranked by average KPI progress
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>KPIs</TableHead>
                    <TableHead>On track</TableHead>
                    <TableHead>Avg progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry.employeeId}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/employees/${entry.employeeId}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry.avatarUrl ?? undefined}
                              alt={entry.fullName}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(entry.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.fullName}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entry.department}</Badge>
                      </TableCell>
                      <TableCell>{entry.kpiCount}</TableCell>
                      <TableCell>{entry.onTrackCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={entry.avgProgress}
                            className="h-2 w-20"
                          />
                          <span className="text-sm font-medium tabular-nums">
                            {entry.avgProgress}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
