"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/shared/components/data/status-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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
import { formatDate } from "@/shared/lib/utils";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/shared/types/roles";
import { approveUserAction } from "@/features/settings/actions/approve-user-action";

export interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  created_at: string;
}

interface PendingOnboardingPanelProps {
  users: PendingUser[];
}

export function PendingOnboardingPanel({ users }: PendingOnboardingPanelProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (users.length === 0) {
    return null;
  }

  const approveUser = async (userId: string, role: AppRole) => {
    setLoadingId(userId);
    try {
      const result = await approveUserAction(userId, role);
      if (result.error) throw new Error(result.error);

      toast.success("User approved");
      if ("warning" in result && result.warning) {
        console.warn("[PendingOnboardingPanel] Notification warning:", result.warning);
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve user",
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border-warning/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pending onboarding
          <StatusBadge status="PENDING" label={`${users.length} waiting`} />
        </CardTitle>
        <CardDescription>
          New users waiting for role assignment. Approve them here or go to{" "}
          <Link href="/settings/roles" className="text-primary hover:underline">
            Role Management
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Assign role & approve</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      defaultValue="EMPLOYEE"
                      disabled={loadingId === user.id}
                      onValueChange={(value) =>
                        void approveUser(user.id, value as AppRole)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {APP_ROLES.filter((r) => r !== "SUPER_ADMIN").map(
                          (role) => (
                            <SelectItem key={role} value={role}>
                              Approve as {ROLE_LABELS[role]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingId === user.id}
                      onClick={() => void approveUser(user.id, "EMPLOYEE")}
                    >
                      Quick approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
