"use client";

import Link from "next/link";
import { ChevronRight, Mail, MapPin } from "lucide-react";

import type { EmployeeProfile } from "@/features/employees/types";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ROLE_LABELS } from "@/shared/types/roles";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface EmployeeMobileCardProps {
  employee: EmployeeProfile;
}

export function EmployeeMobileCard({ employee }: EmployeeMobileCardProps) {
  const { profile, department } = employee;

  return (
    <Link href={`/employees/${employee.profile_id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="h-11 w-11">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{profile.full_name}</p>
              <StatusBadge status={employee.employment_status} />
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {employee.job_title}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {department ? (
                <Badge variant="secondary">{department.name}</Badge>
              ) : null}
              <Badge variant="outline">{ROLE_LABELS[profile.role]}</Badge>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile.email}
              </span>
              {employee.work_location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {employee.work_location}
                </span>
              ) : null}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
