import { test, expect } from "@playwright/test";

test.describe("Dibiz Studio HRMS", () => {
  test("login page loads with branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Dibiz")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create account")).toBeVisible();
  });
});
