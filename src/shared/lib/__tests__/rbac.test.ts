import { hasPermission, getNavItemsForRole } from "@/shared/lib/rbac";

describe("rbac", () => {
  it("SUPER_ADMIN has all permissions via wildcard", () => {
    expect(hasPermission("SUPER_ADMIN", "settings:company")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "audit:read")).toBe(true);
  });

  it("INTERN cannot access company settings", () => {
    expect(hasPermission("INTERN", "settings:company")).toBe(false);
  });

  it("EMPLOYEE sees KPI nav but not employees", () => {
    const items = getNavItemsForRole("EMPLOYEE", "main");
    expect(items.some((i) => i.href === "/kpi")).toBe(true);
    expect(items.some((i) => i.href === "/employees")).toBe(false);
  });

  it("MANAGER sees employees nav", () => {
    const items = getNavItemsForRole("MANAGER", "main");
    expect(items.some((i) => i.href === "/employees")).toBe(true);
  });
});
