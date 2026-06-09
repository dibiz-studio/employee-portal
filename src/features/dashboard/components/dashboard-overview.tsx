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
}

const ROLE_STAT_CONFIG: Record<AppRole, StatConfig[]> = {
  SUPER_ADMIN: [
    {
      title: "Pending Onboarding",
      key: "pendingOnboarding",
      icon: UserPlus,
      description: "Users awaiting role approval",
    },
    {
      title: "Total Employees",
      key: "totalEmployees",
      icon: Users,
      description: "Active profiles in the organization",
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
      description: "Awaiting approval",
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
      description: "In progress across the org",
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
      description: "Need attention",
    },
    {
      title: "Departments",
      key: "departments",
      icon: Building2,
      description: "Active departments",
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
      description: "Your inbox",
    },
  ],
  HR: [
    {
      title: "Pending Onboarding",
      key: "pendingOnboarding",
      icon: UserPlus,
      description: "Users awaiting approval",
    },
    {
      title: "Total Employees",
      key: "totalEmployees",
      icon: Users,
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
    },
    {
      title: "Departments",
      key: "departments",
      icon: Building2,
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
    },
  ],
  MANAGER: [
    {
      title: "Team Members",
      key: "totalEmployees",
      icon: Users,
    },
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
    },
  ],
  EMPLOYEE: [
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
    },
    {
      title: "KPIs at Risk",
      key: "kpiAtRisk",
      icon: AlertTriangle,
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
    },
  ],
  INTERN: [
    {
      title: "Pending Leaves",
      key: "pendingLeaves",
      icon: CalendarClock,
    },
    {
      title: "Active KPIs",
      key: "activeKpis",
      icon: Target,
    },
    {
      title: "Unread Notifications",
      key: "unreadNotifications",
      icon: Bell,
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
