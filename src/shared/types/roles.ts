export type AppRole =
  | "SUPER_ADMIN"
  | "HR"
  | "MANAGER"
  | "EMPLOYEE"
  | "INTERN";

export const ROLE_LABELS: Record<AppRole, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  INTERN: "Intern",
};

export const APP_ROLES: AppRole[] = [
  "SUPER_ADMIN",
  "HR",
  "MANAGER",
  "EMPLOYEE",
  "INTERN",
];
