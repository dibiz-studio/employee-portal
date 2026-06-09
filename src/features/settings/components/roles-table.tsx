"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/shared/components/data/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { createClient } from "@/shared/lib/supabase/client";
import { cn } from "@/shared/lib/utils";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/shared/types/roles";
import type { OnboardingStatus } from "@/shared/stores/auth-store";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  is_active: boolean;
  onboarding_status?: OnboardingStatus;
}

interface RolesTableProps {
  users: UserRow[];
}

export function RolesTable({ users }: RolesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, role: AppRole) => {
    setLoadingId(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role, onboarding_status: "COMPLETED" })
        .eq("id", userId);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "SYSTEM",
        title: "Account approved",
        message: `Your account has been approved as ${ROLE_LABELS[role]}.`,
        link: "/dashboard",
      });

      toast.success("Role updated and user approved");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const sorted = [...users].sort((a, b) => {
    if (a.onboarding_status === "PENDING" && b.onboarding_status !== "PENDING")
      return -1;
    if (b.onboarding_status === "PENDING" && a.onboarding_status !== "PENDING")
      return 1;
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Onboarding</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((user) => {
          const pending = user.onboarding_status === "PENDING";
          return (
            <TableRow
              key={user.id}
              className={cn(pending && "bg-warning/5")}
            >
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <StatusBadge
                  status={pending ? "PENDING" : "COMPLETED"}
                  label={pending ? "Awaiting approval" : "Approved"}
                />
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={user.is_active ? "ACTIVE" : "TERMINATED"}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  disabled={loadingId === user.id}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value as AppRole)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                        {pending ? " (approve)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
