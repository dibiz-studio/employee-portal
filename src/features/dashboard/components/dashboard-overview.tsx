import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import type { DashboardStats } from "@/features/dashboard/services/dashboard.service";
import { StatCard } from "@/shared/components/data/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { AppRole } from "@/shared/types/roles";

interface StatConfig {
  title: string;
  key: keyof DashboardStats;
  icon: LucideIcon;
  description?: string;
  href?: string;
}

const ROLE_STAT_CONFIG: Record<AppRole, StatConfig[]> = {
  SUPER_ADMIN: [
    {
      title: "Pending Onboarding",
      key: "pendingOnboarding",
      icon: UserPlus,
      description: "Users awaiting role approval",
      href: "/settings/roles",
    },
    {
      title: "Total Employees",
      key: "totalEmployees",
      icon: Users,
      description: "Active profiles in the organization",
      href: "/employees",
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      description: "Awaiting approval",
      href: "/leave",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      description: "In progress across the org",
      href: "/kpi",
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
      description: "Need attention",
      href: "/kpi",
    },
    {
      title: "Departments",
      key: "departments",
      icon: Building2,
      description: "Active departments",
      href: "/settings/departments",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      description: "Your inbox",
      href: "/notifications",
    },
  ],
  HR: [
    {
      title: "Pending Onboarding",
      key: "pendingOnboarding",
      icon: UserPlus,
      description: "Users awaiting approval",
      href: "/settings/roles",
    },
    {
      title: "Total Employees",
      key: "totalEmployees",
      icon: Users,
      href: "/employees",
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      href: "/leave",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      href: "/kpi",
    },
    {
      title: "Departments",
      key: "departments",
      icon: Building2,
      href: "/settings/departments",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      href: "/notifications",
    },
  ],
  MANAGER: [
    {
      title: "Team Members",
      key: "totalEmployees",
      icon: Users,
      href: "/employees",
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      href: "/leave",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      href: "/kpi",
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
      href: "/kpi",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      href: "/notifications",
    },
  ],
  EMPLOYEE: [
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      href: "/leave",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      href: "/kpi",
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
      href: "/kpi",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      href: "/notifications",
    },
  ],
  INTERN: [
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      href: "/leave",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      href: "/kpi",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      href: "/notifications",
    },
  ],
};

interface DashboardStatsGridProps {
  role: AppRole;
  stats: DashboardStats;
}

export function DashboardStatsGrid({ role, stats }: DashboardStatsGridProps) {
  const statConfig = ROLE_STAT_CONFIG[role];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {statConfig.map((config) => (
        <StatCard
          key={config.key}
          title={config.title}
          value={stats[config.key]}
          description={config.description}
          icon={config.icon}
          href={config.href}
        />
      ))}
    </div>
  );
}

interface DashboardOverviewProps {
  role: AppRole;
  stats: DashboardStats;
}

export function DashboardOverview({ role, stats }: DashboardOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Live metrics from your Supabase workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardStatsGrid role={role} stats={stats} />
      </CardContent>
    </Card>
  );
}
