import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OnboardingInviteForm } from "../onboarding-invite-form";
import { createOnboardingInviteAction } from "../../actions/onboarding.actions";
import { toast } from "sonner";

jest.mock("../../actions/onboarding.actions", () => ({
  createOnboardingInviteAction: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("OnboardingInviteForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<OnboardingInviteForm managers={[]} />);
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create invite/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<OnboardingInviteForm managers={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Create invite/i }));

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeInTheDocument();
      expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    });
    expect(createOnboardingInviteAction).not.toHaveBeenCalled();
  });

  it("submits successfully with valid data", async () => {
    (createOnboardingInviteAction as jest.Mock).mockResolvedValue({
      success: true,
      inviteUrl: "/onboarding/123",
      expiresAt: new Date().toISOString(),
    });

    render(<OnboardingInviteForm managers={[]} />);
    
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/Joining Letter/i), { target: { value: "https://drive.google.com/test" } });

    fireEvent.click(screen.getByRole("button", { name: /Create invite/i }));

    await waitFor(() => {
      expect(createOnboardingInviteAction).toHaveBeenCalledWith(expect.objectContaining({
        invitee_full_name: "John Doe",
        invitee_email: "john@example.com",
        joining_letter_drive_url: "https://drive.google.com/test",
      }));
      expect(toast.success).toHaveBeenCalledWith("Onboarding invite created");
    });
  });

  it("handles server error", async () => {
    (createOnboardingInviteAction as jest.Mock).mockResolvedValue({
      error: "Invite creation failed",
    });

    render(<OnboardingInviteForm managers={[]} />);
    
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Create invite/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invite creation failed");
    });
  });
});
