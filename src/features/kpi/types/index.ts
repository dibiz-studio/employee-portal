export type KpiStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "ON_TRACK"
  | "AT_RISK"
  | "COMPLETED"
  | "CANCELLED";

export type KpiPeriod = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface KpiTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  measurement_unit: string;
  default_target: number | null;
  period: KpiPeriod;
  department_id: string | null;
  weight: number;
  is_active: boolean;
  created_at: string;
  department: { id: string; name: string; code: string } | null;
}

export interface EmployeeKpi {
  id: string;
  employee_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number;
  period: KpiPeriod;
  period_start: string;
  period_end: string;
  status: KpiStatus;
  notes: string | null;
  created_at: string;
  employee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  template?: { name: string; category: string } | null;
}

export interface KpiDashboardStats {
  total: number;
  onTrack: number;
  atRisk: number;
  completed: number;
  inProgress: number;
  avgCompletion: number;
}

export interface KpiTrendPoint {
  label: string;
  value: number;
  target: number;
}

export interface LeaderboardEntry {
  employeeId: string;
  fullName: string;
  avatarUrl: string | null;
  department: string;
  avgProgress: number;
  kpiCount: number;
  onTrackCount: number;
}
