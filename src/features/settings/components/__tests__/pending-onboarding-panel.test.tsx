import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PendingOnboardingPanel } from "../pending-onboarding-panel";

const mockRefresh = jest.fn();
const mockApproveUserAction = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../actions/approve-user-action", () => ({
  approveUserAction: (...args: unknown[]) => mockApproveUserAction(...args),
}));

describe("PendingOnboardingPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApproveUserAction.mockResolvedValue({ success: true });
  });

  it("renders a stable localized date for pending users", () => {
    render(
      <PendingOnboardingPanel
        users={[
          {
            id: "u1",
            email: "new@example.com",
            full_name: "New User",
            role: "EMPLOYEE",
            created_at: "2026-06-16T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("16 Jun 2026")).toBeInTheDocument();
  });

  it("approves a user and refreshes the dashboard", async () => {
    render(
      <PendingOnboardingPanel
        users={[
          {
            id: "u1",
            email: "new@example.com",
            full_name: "New User",
            role: "EMPLOYEE",
            created_at: "2026-06-16T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Quick approve" }));

    await waitFor(() => {
      expect(mockApproveUserAction).toHaveBeenCalledWith("u1", "EMPLOYEE");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
