import Link from "next/link";
import {
  Bell,
  Building2,
  CalendarDays,
  Target,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { getServerProfile } from "@/features/auth/services/auth-server.service";
import { PageHeader } from "@/shared/components/data/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { hasPermission } from "@/shared/lib/rbac";

const SETTINGS_CARDS = [
  {
    title: "Profile",
    description: "Update your name and contact details",
    href: "/settings/profile",
    icon: User,
    permission: "settings:profile" as const,
  },
  {
    title: "Company",
    description: "Organization overview and configuration",
    href: "/settings/company",
    icon: Building2,
    permission: "settings:company" as const,
  },
  {
    title: "Departments",
    description: "Manage department structure",
    href: "/settings/departments",
    icon: Users,
    permission: "settings:departments" as const,
  },
  {
    title: "Roles",
    description: "Approve new users and assign roles",
    href: "/settings/roles",
    icon: Users,
    permission: "settings:roles" as const,
  },
  {
    title: "Leave",
    description: "Leave policy configuration",
    href: "/settings/leave",
    icon: CalendarDays,
    permission: "settings:policies" as const,
  },
  {
    title: "KPI",
    description: "KPI template defaults",
    href: "/settings/kpi",
    icon: Target,
    permission: "kpi:templates:manage" as const,
  },
  {
    title: "Payroll",
    description: "Payroll allowance and deduction types",
    href: "/settings/payroll",
    icon: Wallet,
    permission: "payroll:settings" as const,
  },
  {
    title: "Notifications",
    description: "Notification preferences",
    href: "/settings/notifications",
    icon: Bell,
    permission: "settings:profile" as const,
  },
];

export default async function SettingsHubPage() {
  const profile = await getServerProfile();
  if (!profile) return null;

  const visibleCards = SETTINGS_CARDS.filter((card) =>
    hasPermission(profile.role, card.permission),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and organization preferences."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-muted-foreground" />
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
