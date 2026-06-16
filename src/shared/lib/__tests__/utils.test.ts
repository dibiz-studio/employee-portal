import { formatDateTime, getLocalDateString } from "../utils";

describe("shared utils", () => {
  it("formats datetime in en-IN locale", () => {
    expect(formatDateTime("2026-06-16T10:15:00Z")).toContain("16 Jun 2026");
  });

  it("returns a stable local date string", () => {
    const date = new Date(2026, 5, 16, 9, 30, 0);
    expect(getLocalDateString(date)).toBe("2026-06-16");
  });
});
