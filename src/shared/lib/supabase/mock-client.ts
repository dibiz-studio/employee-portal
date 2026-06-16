/* eslint-disable @typescript-eslint/no-explicit-any */

export interface CookieManager {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: { path?: string; maxAge?: number }): void;
  delete(name: string): void;
}

export interface MockProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  phone: string | null;
  is_active: boolean;
  onboarding_status: string;
  onboarding_invite_id?: string | null;
  onboarding_started_at?: string | null;
  onboarding_completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockOnboardingInvite {
  id: string;
  invite_token_hash: string;
  invite_token_hint: string | null;
  invitee_email: string;
  invitee_full_name: string | null;
  target_role: string;
  created_by: string;
  assigned_manager_id: string | null;
  estimated_stipend: number | null;
  joining_letter_file_path: string | null;
  joining_letter_signed_file_path: string | null;
  joining_letter_sent_at: string | null;
  joining_letter_returned_at: string | null;
  expires_at: string;
  used_at: string | null;
  used_by_profile_id: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revocation_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MockOnboardingIntake {
  id: string;
  invite_id: string;
  profile_id: string;
  current_step: number;
  status: string;
  full_pan: string | null;
  full_aadhaar: string | null;
  pan_drive_url: string | null;
  aadhaar_drive_url: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MockDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  profiles?: { full_name: string };
}

export interface MockEmployeeProfile {
  id: string;
  profile_id: string;
  employee_code: string;
  department_id: string;
  job_title: string;
  employment_status: string;
  hire_date: string;
  termination_date: string | null;
  date_of_birth: string;
  work_location: string;
  created_at: string;
  updated_at: string;
  profile?: MockProfile;
  profiles?: MockProfile;
  department?: MockDepartment;
  departments?: MockDepartment;
}

export interface MockLeavePolicy {
  id: string;
  name: string;
  code: string;
  description: string | null;
  days_per_year: number;
  is_paid: boolean;
  requires_approval: boolean;
  min_notice_days: number;
  max_consecutive_days: number | null;
  carry_forward: boolean;
  carry_forward_limit: number | null;
  is_active: boolean;
}

export interface MockEmployeeLeavePolicy {
  id: string;
  employee_id: string;
  policy_id: string;
  allocated_days: number;
  used_days: number;
  year: number;
  leave_policies?: { name: string; code: string };
}

export interface MockLeaveRequest {
  id: string;
  employee_id: string;
  policy_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  profiles?: { full_name: string };
  leave_policies?: { name: string };
}

export interface MockKpiTemplate {
  id: string;
  name: string;
  category: string;
  period: string;
  is_active: boolean;
  weight: number;
  default_target: number;
  description?: string;
  created_at?: string;
  created_by?: string;
}

export interface MockEmployeeKpi {
  id: string;
  employee_id: string;
  template_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number;
  period: string;
  period_start: string;
  period_end: string;
  status: string;
  notes: string | null;
  created_at: string;
  employee?: { id: string; full_name: string; avatar_url: string | null };
  template?: { name: string; category: string };
}

export interface MockPayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  net_salary: number;
  status: string;
  payment_date: string | null;
  pdf_url: string | null;
  created_at: string;
  profiles?: { full_name: string };
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MockDailyUpdate {
  id: string;
  employee_id: string;
  brand_id: string | null;
  report_date: string;
  date: string;
  tasks_completed: string[];
  hours_worked: number;
  tasks_in_progress: string;
  blockers: string;
  created_at: string;
  profiles?: { full_name: string };
  brand?: MockBrand | null;
  brands?: MockBrand | null;
}

export interface MockBrand {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website_url: string | null;
  description: string | null;
  status: string;
  created_by: string | null;
  assigned_manager_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles?: { full_name: string };
}

export interface MockDb {
  profiles: MockProfile[];
  onboarding_invites: MockOnboardingInvite[];
  onboarding_intakes: MockOnboardingIntake[];
  brands: MockBrand[];
  departments: MockDepartment[];
  employee_profiles: MockEmployeeProfile[];
  leave_policies: MockLeavePolicy[];
  employee_leave_policy: MockEmployeeLeavePolicy[];
  leave_requests: MockLeaveRequest[];
  kpi_templates: MockKpiTemplate[];
  employee_kpis: MockEmployeeKpi[];
  payroll_records: MockPayrollRecord[];
  notifications: MockNotification[];
  daily_updates: MockDailyUpdate[];
  audit_logs: MockAuditLog[];
  manager_assignments: { employee_id: string; manager_id: string; is_active: boolean }[];
}

const defaultProfiles: MockProfile[] = [
  {
    id: "admin-id-123",
    email: "tech@dibizsolution.com",
    full_name: "Dibiz Tech Admin",
    avatar_url: null,
    role: "SUPER_ADMIN",
    phone: "1234567890",
    is_active: true,
    onboarding_status: "COMPLETED",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "admin-id-456",
    email: "admin@dibizstudio.com",
    full_name: "Dibiz Backup Admin",
    avatar_url: null,
    role: "HR",
    phone: "0987654321",
    is_active: true,
    onboarding_status: "COMPLETED",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "manager-id-789",
    email: "manager@dibizstudio.com",
    full_name: "Dibiz Growth Manager",
    avatar_url: null,
    role: "MANAGER",
    phone: "1112223333",
    is_active: true,
    onboarding_status: "COMPLETED",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "intern-id-789",
    email: "intern@dibizstudio.com",
    full_name: "Dibiz Growth Intern",
    avatar_url: null,
    role: "INTERN",
    phone: "4445556666",
    is_active: true,
    onboarding_status: "COMPLETED",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z"
  }
];

const defaultOnboardingInvites: MockOnboardingInvite[] = [
  {
    id: "invite-1",
    invite_token_hash: "a0eb060749d713d7926aeab566a0141c9633aa53f883c84f0eb0ac9b2fc655dc",
    invite_token_hint: "dibiz-onboarding-demo",
    invitee_email: "new.joiner@dibizstudio.com",
    invitee_full_name: "New Joiner",
    target_role: "EMPLOYEE",
    created_by: "admin-id-456",
    assigned_manager_id: "admin-id-123",
    estimated_stipend: 42000,
    joining_letter_file_path: "/documents/joining-letter.pdf",
    joining_letter_signed_file_path: null,
    joining_letter_sent_at: "2026-06-09T08:00:00.000Z",
    joining_letter_returned_at: null,
    expires_at: "2026-12-31T23:59:59.000Z",
    used_at: null,
    used_by_profile_id: null,
    revoked_at: null,
    revoked_by: null,
    revocation_reason: null,
    metadata: { cohort: "June 2026", source: "hr-invite" },
    created_at: "2026-06-09T08:00:00.000Z",
    updated_at: "2026-06-09T08:00:00.000Z"
  }
];

const defaultOnboardingIntakes: MockOnboardingIntake[] = [];

const defaultDepartments: MockDepartment[] = [
  { id: "dept-1", name: "Engineering", code: "ENG", description: "Product Engineering", is_active: true, profiles: { full_name: "Dibiz Tech Admin" } },
  { id: "dept-2", name: "Human Resources", code: "HR", description: "HR and Operations", is_active: true, profiles: { full_name: "Dibiz Backup Admin" } },
  { id: "dept-3", name: "Marketing", code: "MKT", description: "Social Media and Design", is_active: true, profiles: { full_name: "Dibiz Backup Admin" } }
];

const defaultBrands: MockBrand[] = [
  {
    id: "brand-1",
    name: "Acme Studio",
    slug: "acme-studio",
    industry: "Beauty",
    website_url: "https://acme.example",
    description: "Primary retainer brand for social and performance work.",
    status: "ACTIVE",
    created_by: "admin-id-456",
    assigned_manager_id: "admin-id-123",
    notes: "Priority growth account",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "brand-2",
    name: "Northline Foods",
    slug: "northline-foods",
    industry: "FMCG",
    website_url: "https://northline.example",
    description: "Content and campaign account for growth marketing.",
    status: "ACTIVE",
    created_by: "admin-id-456",
    assigned_manager_id: "admin-id-123",
    notes: "Focus on conversions and creator campaigns",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z"
  }
];

const defaultEmployeeProfiles: MockEmployeeProfile[] = [
  {
    id: "emp-profile-123",
    profile_id: "admin-id-123",
    employee_code: "EMP-001",
    department_id: "dept-1",
    job_title: "Tech Lead",
    employment_status: "FULL_TIME",
    hire_date: "2024-01-01",
    termination_date: null,
    date_of_birth: "1995-05-15",
    work_location: "Remote",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    profile: defaultProfiles[0],
    profiles: defaultProfiles[0],
    department: defaultDepartments[0],
    departments: defaultDepartments[0]
  },
  {
    id: "emp-profile-456",
    profile_id: "admin-id-456",
    employee_code: "EMP-002",
    department_id: "dept-2",
    job_title: "HR Manager",
    employment_status: "FULL_TIME",
    hire_date: "2024-02-01",
    termination_date: null,
    date_of_birth: "1990-10-10",
    work_location: "Onsite",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    profile: defaultProfiles[1],
    profiles: defaultProfiles[1],
    department: defaultDepartments[1],
    departments: defaultDepartments[1]
  },
  {
    id: "emp-profile-789",
    profile_id: "manager-id-789",
    employee_code: "EMP-003",
    department_id: "dept-3",
    job_title: "Growth Manager",
    employment_status: "FULL_TIME",
    hire_date: "2024-03-01",
    termination_date: null,
    date_of_birth: "1992-07-20",
    work_location: "Hybrid",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    profile: defaultProfiles[2],
    profiles: defaultProfiles[2],
    department: defaultDepartments[2],
    departments: defaultDepartments[2]
  },
  {
    id: "emp-profile-890",
    profile_id: "intern-id-789",
    employee_code: "INT-001",
    department_id: "dept-3",
    job_title: "Growth Intern",
    employment_status: "PROBATION",
    hire_date: "2026-06-01",
    termination_date: null,
    date_of_birth: "2002-11-11",
    work_location: "Remote",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    profile: defaultProfiles[3],
    profiles: defaultProfiles[3],
    department: defaultDepartments[2],
    departments: defaultDepartments[2]
  }
];

const defaultLeavePolicies: MockLeavePolicy[] = [
  {
    id: "policy-1",
    name: "Annual Leave",
    code: "AL",
    description: "Paid annual leave",
    days_per_year: 20,
    is_paid: true,
    requires_approval: true,
    min_notice_days: 2,
    max_consecutive_days: 10,
    carry_forward: true,
    carry_forward_limit: 5,
    is_active: true
  },
  {
    id: "policy-2",
    name: "Sick Leave",
    code: "SL",
    description: "Paid sick leave",
    days_per_year: 10,
    is_paid: true,
    requires_approval: false,
    min_notice_days: 0,
    max_consecutive_days: 5,
    carry_forward: false,
    carry_forward_limit: 0,
    is_active: true
  }
];

const defaultEmployeeLeavePolicies: MockEmployeeLeavePolicy[] = [
  {
    id: "elp-1",
    employee_id: "admin-id-123",
    policy_id: "policy-1",
    allocated_days: 20,
    used_days: 2,
    year: 2026,
    leave_policies: { name: "Annual Leave", code: "AL" }
  },
  {
    id: "elp-2",
    employee_id: "admin-id-123",
    policy_id: "policy-2",
    allocated_days: 10,
    used_days: 0,
    year: 2026,
    leave_policies: { name: "Sick Leave", code: "SL" }
  }
];

const defaultLeaveRequests: MockLeaveRequest[] = [
  {
    id: "lr-1",
    employee_id: "admin-id-123",
    policy_id: "policy-1",
    start_date: "2026-06-12",
    end_date: "2026-06-15",
    days_requested: 3,
    reason: "Family event",
    status: "APPROVED",
    reviewed_by: "admin-id-456",
    reviewed_at: "2026-06-01T10:00:00.000Z",
    review_notes: "Approved, make sure to hand over tasks.",
    created_at: "2026-06-01T09:00:00.000Z",
    profiles: { full_name: "Dibiz Tech Admin" },
    leave_policies: { name: "Annual Leave" }
  }
];

const defaultKpiTemplates: MockKpiTemplate[] = [
  {
    id: "kpi-temp-1",
    name: "Code Quality & Design Guidelines",
    category: "Technical",
    period: "Quarterly",
    is_active: true,
    weight: 30,
    default_target: 95,
    description: "Follow best coding standards and architectural rules."
  },
  {
    id: "kpi-temp-2",
    name: "On-Time Delivery",
    category: "Productivity",
    period: "Monthly",
    is_active: true,
    weight: 40,
    default_target: 90,
    description: "Submit task deliverables and updates on time."
  }
];

const defaultEmployeeKpis: MockEmployeeKpi[] = [
  {
    id: "ek-1",
    employee_id: "admin-id-123",
    template_id: "kpi-temp-1",
    title: "Refactor Frontend Architecture",
    description: "Implement modern structures and clean styles.",
    target_value: 95,
    current_value: 90,
    unit: "%",
    weight: 30,
    period: "Q2 2026",
    period_start: "2026-04-01",
    period_end: "2026-06-30",
    status: "ON_TRACK",
    notes: "Good progress so far.",
    created_at: "2026-04-05T00:00:00.000Z",
    employee: { id: "admin-id-123", full_name: "Dibiz Tech Admin", avatar_url: null },
    template: { name: "Code Quality & Design Guidelines", category: "Technical" }
  }
];

const defaultPayrollRecords: MockPayrollRecord[] = [
  {
    id: "pr-1",
    employee_id: "admin-id-123",
    month: 5,
    year: 2026,
    basic_salary: 120000,
    allowances: { HRA: 30000, "Internet Allowance": 2000 },
    deductions: { "PF Contribution": 12000, "Professional Tax": 200 },
    net_salary: 139800,
    status: "PAID",
    payment_date: "2026-05-31",
    pdf_url: null,
    created_at: "2026-05-25T00:00:00.000Z",
    profiles: { full_name: "Dibiz Tech Admin" }
  }
];

const defaultNotifications: MockNotification[] = [
  {
    id: "notif-1",
    user_id: "admin-id-123",
    title: "Welcome to Dibiz Studio Portal",
    message: "Your HRMS dashboard is set up and ready.",
    type: "SYSTEM",
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString()
  }
];

const defaultDailyUpdates: MockDailyUpdate[] = [
  {
    id: "update-1",
    employee_id: "admin-id-123",
    brand_id: "brand-1",
    report_date: "2026-06-09",
    date: "2026-06-09",
    tasks_completed: [
      "Replaced supabase clients with mock",
      "Added local cookie state management",
    ],
    hours_worked: 6.5,
    tasks_in_progress: "- Running build tests",
    blockers: "None",
    created_at: "2026-06-09T18:00:00.000Z",
    profiles: { full_name: "Dibiz Tech Admin" },
    brand: defaultBrands[0],
    brands: defaultBrands[0]
  },
  {
    id: "update-2",
    employee_id: "intern-id-789",
    brand_id: "brand-2",
    report_date: "2026-06-10",
    date: "2026-06-10",
    tasks_completed: [
      "Shadowed client campaign review",
      "Prepared social content notes",
    ],
    hours_worked: 7,
    tasks_in_progress: "- Drafting next day content plan",
    blockers: "Waiting on asset approval",
    created_at: "2026-06-10T18:00:00.000Z",
    profiles: { full_name: "Dibiz Growth Intern" },
    brand: defaultBrands[1],
    brands: defaultBrands[1]
  }
];

const defaultAuditLogs: MockAuditLog[] = [
  {
    id: "audit-1",
    actor_id: "admin-id-123",
    action: "LOGIN",
    entity_type: "AUTH",
    entity_id: "admin-id-123",
    old_values: null,
    new_values: { ip: "127.0.0.1" },
    ip_address: "127.0.0.1",
    created_at: new Date().toISOString(),
    profiles: { full_name: "Dibiz Tech Admin" }
  }
];

const defaultManagerAssignments = [
  { employee_id: "admin-id-123", manager_id: "admin-id-456", is_active: true }
  ,{ employee_id: "intern-id-789", manager_id: "manager-id-789", is_active: true }
];

const globalWithDb = globalThis as unknown as { mockDb?: MockDb };

export function getMockDb(): MockDb {
  if (!globalWithDb.mockDb) {
    globalWithDb.mockDb = {
      profiles: [...defaultProfiles],
      onboarding_invites: [...defaultOnboardingInvites],
      onboarding_intakes: [...defaultOnboardingIntakes],
      brands: [...defaultBrands],
      departments: [...defaultDepartments],
      employee_profiles: [...defaultEmployeeProfiles],
      leave_policies: [...defaultLeavePolicies],
      employee_leave_policy: [...defaultEmployeeLeavePolicies],
      leave_requests: [...defaultLeaveRequests],
      kpi_templates: [...defaultKpiTemplates],
      employee_kpis: [...defaultEmployeeKpis],
      payroll_records: [...defaultPayrollRecords],
      notifications: [...defaultNotifications],
      daily_updates: [...defaultDailyUpdates],
      audit_logs: [...defaultAuditLogs],
      manager_assignments: [...defaultManagerAssignments]
    };
  }
  const db = globalWithDb.mockDb;
  db.daily_updates = db.daily_updates.map(
    (row) => normalizeMockDailyUpdate(row, db),
  );
  return db;
}

function syncMockOnboardingState(row: MockOnboardingIntake) {
  const db = getMockDb();
  const invite = db.onboarding_invites.find((item) => item.id === row.invite_id);
  const profile = db.profiles.find((item) => item.id === row.profile_id);

  if (!invite || !profile) return;

  if (
    row.status === "SUBMITTED" ||
    row.status === "UNDER_REVIEW" ||
    row.status === "NEEDS_CHANGES" ||
    row.status === "APPROVED"
  ) {
    invite.used_at = invite.used_at ?? new Date().toISOString();
    invite.used_by_profile_id = invite.used_by_profile_id ?? row.profile_id;
    invite.updated_at = new Date().toISOString();
    profile.onboarding_invite_id = profile.onboarding_invite_id ?? invite.id;
    profile.onboarding_started_at = profile.onboarding_started_at ?? new Date().toISOString();
    profile.updated_at = new Date().toISOString();
  }

  if (row.status === "APPROVED") {
    profile.onboarding_status = "COMPLETED";
    profile.onboarding_completed_at = profile.onboarding_completed_at ?? new Date().toISOString();
    profile.updated_at = new Date().toISOString();
  }
}

function attachMockBrandRelation(db: MockDb, row: MockDailyUpdate) {
  const brand = row.brand_id
    ? db.brands.find((item) => item.id === row.brand_id) ?? null
    : null;
  row.brand = brand;
  row.brands = brand;
}

function normalizeMockDailyUpdate(
  row: MockDailyUpdate | Record<string, any>,
  db: MockDb,
): MockDailyUpdate {
  if (typeof row.tasks_completed === "string") {
    row.tasks_completed = row.tasks_completed
      .split(/\r?\n+/)
      .map((task: string) => task.replace(/^-+\s*/, "").trim())
      .filter(Boolean);
  }

  if (!Array.isArray(row.tasks_completed)) {
    row.tasks_completed = [];
  }

  attachMockBrandRelation(db, row as MockDailyUpdate);
  return row as MockDailyUpdate;
}

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderColumn?: string;
  private orderAscending = true;
  private limitCount?: number;
  private isSingle = false;
  private isMaybeSingle = false;
  private isUpdate = false;
  private isUpsert = false;
  private isInsert = false;
  private isDelete = false;
  private mutationData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns?: string, _options?: { count?: string; head?: boolean }) {
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.mutationData = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.mutationData = data;
    return this;
  }

  upsert(data: any) {
    this.isUpsert = true;
    this.mutationData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      const parts = column.split(".");
      let val: any = item;
      for (const part of parts) {
        if (val == null) return false;
        val = val[part];
      }
      return val === value;
    });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => {
      const parts = column.split(".");
      let val: any = item;
      for (const part of parts) {
        if (val == null) return true;
        val = val[part];
      }
      return val !== value;
    });
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === "eq") {
      return this.neq(column, value);
    }
    return this;
  }

  or(_filters: string) {
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => item[column] > value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => item[column] < value);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => item[column] <= value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => values.includes(item[column]));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(limitNum: number) {
    this.limitCount = limitNum;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async execute() {
    const db = getMockDb();
    const tableKey = this.tableName as keyof MockDb;
    const dataList = (db[tableKey] || []) as any[];

    if (this.isInsert) {
      const rows = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const insertedRows = rows.map((r) => {
        const newRow: any = {
          id: r.id || `mock-id-${Math.random().toString(36).substring(2, 11)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...r
        };

        if (this.tableName === "profiles") {
          newRow.is_active = newRow.is_active ?? true;
          newRow.onboarding_status = newRow.onboarding_status ?? "PENDING";
          newRow.role = newRow.role ?? "EMPLOYEE";
        }

        if (this.tableName === "onboarding_intakes") {
          newRow.current_step = newRow.current_step ?? 1;
          newRow.status = newRow.status ?? "DRAFT";
          newRow.full_pan = newRow.full_pan ?? null;
          newRow.full_aadhaar = newRow.full_aadhaar ?? null;
          newRow.pan_drive_url = newRow.pan_drive_url ?? null;
          newRow.aadhaar_drive_url = newRow.aadhaar_drive_url ?? null;
          newRow.review_notes = newRow.review_notes ?? null;
          newRow.submitted_at = newRow.submitted_at ?? null;
          newRow.reviewed_by = newRow.reviewed_by ?? null;
          newRow.reviewed_at = newRow.reviewed_at ?? null;
          newRow.completed_at = newRow.completed_at ?? null;
        }

        if (this.tableName === "employee_profiles") {
          const profile = db.profiles.find((p) => p.id === newRow.profile_id);
          const department = db.departments.find((d) => d.id === newRow.department_id);
          newRow.profile = profile;
          newRow.profiles = profile;
          newRow.department = department;
          newRow.departments = department;
        }

        if (this.tableName === "leave_requests") {
          const profile = db.profiles.find((p) => p.id === newRow.employee_id);
          const policy = db.leave_policies.find((p) => p.id === newRow.policy_id);
          newRow.profiles = { full_name: profile?.full_name || "Unknown" };
          newRow.leave_policies = { name: policy?.name || "Unknown" };
        }

        if (this.tableName === "daily_updates") {
          newRow.report_date = newRow.report_date ?? newRow.date ?? newRow.created_at.split("T")[0];
          newRow.hours_worked = Number(newRow.hours_worked ?? 0);
          const profile = db.profiles.find((p) => p.id === newRow.employee_id);
          newRow.profiles = { full_name: profile?.full_name || "Unknown" };
          normalizeMockDailyUpdate(newRow as MockDailyUpdate, db);
        }

        if (this.tableName === "payroll_records") {
          const profile = db.profiles.find((p) => p.id === newRow.employee_id);
          newRow.profiles = { full_name: profile?.full_name || "Unknown" };
        }

        if (this.tableName === "audit_logs") {
          const profile = db.profiles.find((p) => p.id === newRow.actor_id);
          newRow.profiles = { full_name: profile?.full_name || "System" };
        }

        if (this.tableName === "onboarding_intakes") {
          syncMockOnboardingState(newRow as MockOnboardingIntake);
        }

        return newRow;
      });

      dataList.push(...insertedRows);
      return { data: Array.isArray(this.mutationData) ? insertedRows : insertedRows[0], count: insertedRows.length, error: null };
    }

    if (this.isUpdate) {
      let affectedCount = 0;
      const updatedRows: any[] = [];
      dataList.forEach((item, index) => {
        let matches = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false;
            break;
          }
        }
        if (matches) {
          const updated = {
            ...item,
            ...this.mutationData,
            updated_at: new Date().toISOString()
          };
          dataList[index] = updated;
          updatedRows.push(updated);
          if (this.tableName === "onboarding_intakes") {
            syncMockOnboardingState(updated as MockOnboardingIntake);
          }
          if (this.tableName === "daily_updates") {
            updated.report_date = updated.report_date ?? updated.date ?? updated.created_at.split("T")[0];
            updated.hours_worked = Number(updated.hours_worked ?? 0);
            normalizeMockDailyUpdate(updated as MockDailyUpdate, db);
          }
          affectedCount++;
        }
      });
      return { data: updatedRows.length > 0 ? updatedRows[0] : null, count: affectedCount, error: null };
    }

    if (this.isUpsert) {
      const rows = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const upsertedRows = rows.map((r) => {
        const existingIdx = dataList.findIndex((item) => item.id === r.id);
        if (existingIdx >= 0) {
          const updated = {
            ...dataList[existingIdx],
            ...r,
            updated_at: new Date().toISOString()
          };
          dataList[existingIdx] = updated;
          if (this.tableName === "onboarding_intakes") {
            syncMockOnboardingState(updated as MockOnboardingIntake);
          }
          if (this.tableName === "daily_updates") {
            normalizeMockDailyUpdate(updated as MockDailyUpdate, db);
          }
          return updated;
        } else {
          const newRow = {
            id: r.id || `mock-id-${Math.random().toString(36).substring(2, 11)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...r
          };
          dataList.push(newRow);
          if (this.tableName === "onboarding_intakes") {
            syncMockOnboardingState(newRow as MockOnboardingIntake);
          }
          if (this.tableName === "daily_updates") {
            newRow.report_date = newRow.report_date ?? newRow.date ?? newRow.created_at.split("T")[0];
            newRow.hours_worked = Number(newRow.hours_worked ?? 0);
            normalizeMockDailyUpdate(newRow as MockDailyUpdate, db);
          }
          return newRow;
        }
      });
      return { data: Array.isArray(this.mutationData) ? upsertedRows : upsertedRows[0], count: upsertedRows.length, error: null };
    }

    if (this.isDelete) {
      const beforeLength = dataList.length;
      const remaining: any[] = [];
      const deleted: any[] = [];

      dataList.forEach((item) => {
        let matches = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false;
            break;
          }
        }
        if (matches) {
          deleted.push(item);
        } else {
          remaining.push(item);
        }
      });

      db[tableKey] = remaining as any;
      return { data: deleted, count: beforeLength - remaining.length, error: null };
    }

    let result = [...dataList];

    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.orderColumn) {
      result.sort((a, b) => {
        const valA = a[this.orderColumn!];
        const valB = b[this.orderColumn!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      if (result.length === 0) {
        return { data: null, count: 0, error: { message: "Row not found" } };
      }
      return { data: result[0], count: 1, error: null };
    }

    if (this.isMaybeSingle) {
      return { data: result.length > 0 ? result[0] : null, count: result.length > 0 ? 1 : 0, error: null };
    }

    return { data: result, count: result.length, error: null };
  }

  then(onfulfilled?: ((value: any) => any) | null, onrejected?: ((reason: any) => any) | null): Promise<any> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export class MockSupabaseClient {
  constructor(private cookieManager: CookieManager) {}

  auth = {
    getUser: async () => {
      const userId = this.cookieManager.get("mock-session-user-id");
      if (!userId) {
        return { data: { user: null }, error: null };
      }
      const db = getMockDb();
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        return { data: { user: null }, error: null };
      }
      return {
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role,
              onboarding_status: profile.onboarding_status
            }
          }
        },
        error: null
      };
    },

    signInWithOAuth: async (options: { provider: string; options?: { redirectTo?: string } }) => {
      const redirectUrl = options.options?.redirectTo || '/dashboard';
      const db = getMockDb();

      // Show a Google-style account picker dialog (mock environment)
      const selectedUserId = await new Promise<string | null>((resolve) => {
        if (typeof document === 'undefined') { resolve('admin-id-123'); return; }

        const overlay = document.createElement('div');
        overlay.id = 'mock-google-picker';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';

        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:12px;width:360px;max-width:90vw;box-shadow:0 8px 40px rgba(0,0,0,0.28);overflow:hidden;';

        const header = document.createElement('div');
        header.style.cssText = 'padding:24px 24px 16px;text-align:center;border-bottom:1px solid #e8eaed;';
        header.innerHTML = '<div style="font-size:18px;font-weight:600;color:#202124;margin-bottom:4px;">Sign in with Google</div><div style="font-size:13px;color:#5f6368;">Choose an account to continue to<br><strong>Dibiz Studio HRMS</strong></div>';

        const list = document.createElement('div');
        const accounts = db.profiles.filter((p: any) => p.is_active);
        const palette = ['#4285F4','#34A853','#EA4335','#FBBC05','#9C27B0'];

        accounts.forEach((acc: any, idx: number) => {
          const row = document.createElement('button');
          row.type = 'button';
          row.style.cssText = 'width:100%;display:flex;align-items:center;gap:12px;padding:12px 20px;border:none;background:transparent;cursor:pointer;text-align:left;border-bottom:1px solid #f1f3f4;';
          row.onmouseenter = () => { row.style.background = '#f8f9fa'; };
          row.onmouseleave = () => { row.style.background = 'transparent'; };
          const initials = acc.full_name.split(' ').map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase();
          const color = palette[idx % palette.length];
          row.innerHTML = '<div style=width:40px;height:40px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:15px;flex-shrink:0;>' + initials + '</div><div style=flex:1;min-width:0;><div style=font-size:14px;font-weight:500;color:#202124;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;>' + acc.full_name + '</div><div style=font-size:12px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;>' + acc.email + '</div></div><div style=font-size:11px;color:#80868b;background:#f1f3f4;padding:2px 8px;border-radius:99px;white-space:nowrap;>' + acc.role.replace(/_/g,' ') + '</div>';
          row.addEventListener('click', () => { document.body.removeChild(overlay); resolve(acc.id); });
          list.appendChild(row);
        });

        const footer = document.createElement('div');
        footer.style.cssText = 'padding:12px 20px;display:flex;justify-content:flex-end;';
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = 'padding:8px 16px;border:none;border-radius:6px;cursor:pointer;background:transparent;color:#5f6368;font-size:14px;font-weight:500;';
        cancelBtn.onmouseenter = () => { cancelBtn.style.background = '#f8f9fa'; };
        cancelBtn.onmouseleave = () => { cancelBtn.style.background = 'transparent'; };
        cancelBtn.addEventListener('click', () => { document.body.removeChild(overlay); resolve(null); });
        footer.appendChild(cancelBtn);

        card.appendChild(header);
        card.appendChild(list);
        card.appendChild(footer);
        overlay.appendChild(card);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) { document.body.removeChild(overlay); resolve(null); } });
        document.body.appendChild(overlay);
      });

      if (!selectedUserId) {
        return { data: { provider: options.provider, url: null }, error: { message: 'Sign-in cancelled' } };
      }

      let userId = selectedUserId;

      if (redirectUrl.includes('invite=')) {
        try {
          const urlObj = new URL(redirectUrl.startsWith('http') ? redirectUrl : 'http://localhost' + redirectUrl);
          const inviteToken = urlObj.searchParams.get('invite');
          if (inviteToken) {
            let invitee_email = '';
            let invitee_full_name = '';
            let target_role = 'EMPLOYEE';
            if (typeof window !== 'undefined') {
              try {
                const res = await fetch('/api/onboarding/invite?token=' + encodeURIComponent(inviteToken));
                if (res.ok) {
                  const data = await res.json();
                  if (data.invite) {
                    invitee_email = data.invite.invitee_email;
                    invitee_full_name = data.invite.invitee_full_name;
                    target_role = data.invite.target_role;
                  }
                }
              } catch (e) { console.error('Failed to fetch invite for mock', e); }
            }
            if (!invitee_email) {
              const invite = db.onboarding_invites.find((i: any) =>
                i.invite_token_hash === inviteToken || i.id === inviteToken ||
                (i.invite_token_hint && i.invite_token_hint.endsWith('-' + inviteToken.slice(0, 6)))
              );
              if (invite) {
                invitee_email = invite.invitee_email;
                invitee_full_name = invite.invitee_full_name || invitee_email.split('@')[0];
                target_role = invite.target_role || 'EMPLOYEE';
              }
            }
            if (invitee_email) {
              let profile = db.profiles.find((p: any) => p.email === invitee_email);
              if (!profile) {
                const newId = 'user-' + Math.random().toString(36).substring(2, 11);
                profile = { id: newId, email: invitee_email, full_name: invitee_full_name || invitee_email.split('@')[0], avatar_url: null, role: target_role, phone: null, is_active: true, onboarding_status: 'PENDING', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
                db.profiles.push(profile);
              }
              userId = profile.id;
            }
          }
        } catch (_e) { /* fallback to selected user */ }
      }

      this.cookieManager.set('mock-session-user-id', userId, { path: '/' });
      if (typeof window !== 'undefined') { window.location.href = redirectUrl; }
      return { data: { provider: options.provider, url: redirectUrl }, error: null };
    },

    signUp: async (options: { email: string; password?: string; options?: { data?: Record<string, any> } }) => {
      const db = getMockDb();
      let profile = db.profiles.find((p) => p.email === options.email);
      if (!profile) {
        profile = {
          id: `user-${Math.random().toString(36).substring(2, 11)}`,
          email: options.email,
          full_name: options.options?.data?.full_name || options.email.split("@")[0],
          avatar_url: null,
          role: options.options?.data?.role || "EMPLOYEE",
          phone: null,
          is_active: true,
          onboarding_status: options.options?.data?.onboarding_status || "PENDING",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.profiles.push(profile);
      }
      this.cookieManager.set("mock-session-user-id", profile.id, { path: "/" });
      return {
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role,
              onboarding_status: profile.onboarding_status
            }
          },
          session: {
            access_token: "mock-token",
            refresh_token: "mock-token",
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: profile.id,
              email: profile.email
            }
          }
        },
        error: null
      };
    },

    signInWithPassword: async (options: { email: string; password?: string }) => {
      const db = getMockDb();
      const profile = db.profiles.find((p) => p.email === options.email);
      if (!profile) {
        return { data: { user: null, session: null }, error: { message: "Invalid credentials" } };
      }
      this.cookieManager.set("mock-session-user-id", profile.id, { path: "/" });
      return {
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role,
              onboarding_status: profile.onboarding_status
            }
          },
          session: {
            access_token: "mock-token",
            refresh_token: "mock-token",
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: profile.id,
              email: profile.email
            }
          }
        },
        error: null
      };
    },

    signOut: async () => {
      this.cookieManager.delete("mock-session-user-id");
      return { error: null };
    },

    resetPasswordForEmail: async (_email: string, _options?: { redirectTo?: string }) => {
      return { error: null };
    },

    exchangeCodeForSession: async (code: string) => {
      if (code === "mock-code" || code) {
        this.cookieManager.set("mock-session-user-id", "admin-id-123", { path: "/" });
        return { error: null };
      }
      return { error: { message: "Invalid code" } };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const userId = this.cookieManager.get("mock-session-user-id");
      if (userId) {
        const db = getMockDb();
        const profile = db.profiles.find((p) => p.id === userId);
        if (profile) {
          callback("SIGNED_IN", {
            user: {
              id: profile.id,
              email: profile.email,
              user_metadata: {
                full_name: profile.full_name,
                role: profile.role,
                onboarding_status: profile.onboarding_status
              }
            }
          });
        }
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  }
}
