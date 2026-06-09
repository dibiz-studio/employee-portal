"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { EmployeeMobileCard } from "@/features/employees/components/employee-mobile-card";
import type { EmployeeProfile } from "@/features/employees/types";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ROLE_LABELS } from "@/shared/types/roles";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface EmployeeDirectoryProps {
  employees: EmployeeProfile[];
}

export function EmployeeDirectory({ employees }: EmployeeDirectoryProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((emp) => {
      const haystack = [
        emp.profile.full_name,
        emp.profile.email,
        emp.employee_code,
        emp.job_title,
        emp.department?.name ?? "",
        emp.department?.code ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [employees, search]);

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No employees yet"
        description="Employees will appear here once they are added to the organization."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, code, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description="Try adjusting your search terms."
        />
      ) : (
        <>
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Link
                        href={`/employees/${employee.profile_id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={employee.profile.avatar_url ?? undefined}
                            alt={employee.profile.full_name}
                          />
                          <AvatarFallback>
                            {getInitials(employee.profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.profile.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {employee.profile.email}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {employee.employee_code}
                    </TableCell>
                    <TableCell>
                      {employee.department ? (
                        <Badge variant="secondary">{employee.department.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_LABELS[employee.profile.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={employee.employment_status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.work_location ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((employee) => (
              <EmployeeMobileCard key={employee.id} employee={employee} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
