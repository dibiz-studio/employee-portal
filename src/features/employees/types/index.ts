import type { AppRole } from "@/shared/types/roles";

export type EmploymentStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "PROBATION"
  | "TERMINATED"
  | "RESIGNED";

export interface EmployeeProfile {
  id: string;
  profile_id: string;
  employee_code: string;
  department_id: string | null;
  job_title: string;
  employment_status: EmploymentStatus;
  hire_date: string;
  termination_date: string | null;
  date_of_birth: string | null;
  work_location: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: AppRole;
    phone: string | null;
    is_active: boolean;
  };
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface DepartmentWithStats {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  head: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  employee_count: number;
}

export interface LeaveRequestSummary {
  id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  policy: { name: string; code: string } | null;
}
