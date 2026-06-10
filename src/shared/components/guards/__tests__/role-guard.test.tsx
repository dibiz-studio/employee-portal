import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RoleGuard } from "../role-guard";
import { useAuthStore } from "../../../stores/auth-store";

// Mock the auth store
jest.mock("../../../stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

describe("RoleGuard component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when role is allowed", () => {
    // Mock user being HR
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ profile: { role: "HR" } })
    );

    render(
      <RoleGuard allowed={["HR", "SUPER_ADMIN"]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders fallback when role is not allowed", () => {
    // Mock user being EMPLOYEE
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ profile: { role: "EMPLOYEE" } })
    );

    render(
      <RoleGuard allowed={["HR", "SUPER_ADMIN"]} fallback={<div>Access Denied</div>}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("renders nothing (null fallback) when role is not allowed and no fallback is specified", () => {
    // Mock user being EMPLOYEE
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ profile: { role: "EMPLOYEE" } })
    );

    const { container } = render(
      <RoleGuard allowed={["HR", "SUPER_ADMIN"]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
