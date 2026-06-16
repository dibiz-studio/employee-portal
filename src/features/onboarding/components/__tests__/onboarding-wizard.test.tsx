/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── next/navigation must be mocked before component import ───────────────────
const mockUseSearchParams = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ token: "mock-token" }),
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => mockUseSearchParams(),
}));

// ── sonner toast ─────────────────────────────────────────────────────────────
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

// ── auth-provider (useAuth) ───────────────────────────────────────────────────
const mockAuthSignOut = jest.fn();
jest.mock("../../../../features/auth/components/auth-provider", () => ({
  useAuth: () => ({ signOut: mockAuthSignOut }),
}));

// ── auth service (fetchProfile) ───────────────────────────────────────────────
jest.mock("../../../../features/auth/services/auth.service", () => ({
  fetchProfile: jest.fn().mockResolvedValue(null),
}));

// ── auth store ────────────────────────────────────────────────────────────────
const mockProfile = { id: "profile-1", email: "new@example.com", onboarding_status: "PENDING" };
jest.mock("../../../../shared/stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

// ── onboarding service ────────────────────────────────────────────────────────
const mockFetchInvite = jest.fn();
const mockFetchOnboardingIntake = jest.fn();
const mockSaveOnboardingDraft = jest.fn();
const mockSubmitOnboardingIntake = jest.fn();

jest.mock("../../../../features/onboarding/services/onboarding.service", () => ({
  fetchInvite: (...args: unknown[]) => mockFetchInvite(...args),
  fetchOnboardingIntake: (...args: unknown[]) => mockFetchOnboardingIntake(...args),
  saveOnboardingDraft: (...args: unknown[]) => mockSaveOnboardingDraft(...args),
  submitOnboardingIntake: (...args: unknown[]) => mockSubmitOnboardingIntake(...args),
}));

// ── import component AFTER mocks ──────────────────────────────────────────────
import { OnboardingWizard } from "../onboarding-wizard";
import { useAuthStore } from "../../../../shared/stores/auth-store";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────

const MOCK_INVITE = {
  id: "invite-1",
  invitee_full_name: "Test User",
  invitee_email: "new@example.com",
  joining_letter_file_path: "https://drive.google.com/hr-letter",
  target_role: "EMPLOYEE",
  estimated_stipend: null,
  metadata: { manager_name: "Boss" },
};

describe("OnboardingWizard component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams({ invite: "mock-token" }));

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        profile: mockProfile,
        setProfile: jest.fn(),
      };
      return selector ? selector(state) : state;
    });

    mockFetchInvite.mockResolvedValue({
      status: "active",
      invite: MOCK_INVITE,
    });
    mockFetchOnboardingIntake.mockResolvedValue(null);
    mockSaveOnboardingDraft.mockResolvedValue({});
    mockSubmitOnboardingIntake.mockResolvedValue({});
  });

  // ── Test 1: Loading state ───────────────────────────────────────────────────
  it("shows loading state initially then loads invite", async () => {
    render(<OnboardingWizard />);
    // Immediately shows loading (inviteToken present, loadingInvite starts true)
    expect(screen.getByText("Loading onboarding")).toBeInTheDocument();

    // After async fetch, renders wizard
    await waitFor(() => {
      expect(screen.getByText("Complete your onboarding")).toBeInTheDocument();
    });
  });

  // ── Test 2: Step 1 — invite summary ─────────────────────────────────────────
  it("renders step 1 with invite summary after loading", async () => {
    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Invite summary")).toBeInTheDocument();
    });

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
    expect(screen.getByText("Boss")).toBeInTheDocument();
  });

  // ── Test 3: Validation — signed joining letter required ─────────────────────
  it("blocks submission if signed joining letter is missing when HR provided one", async () => {
    await act(async () => {
      render(<OnboardingWizard />);
    });

    // Wait for step 1 to be visible
    await waitFor(() => {
      expect(screen.getByText("Complete your onboarding")).toBeInTheDocument();
    });

    // Advance to step 2 (Identity / Full PAN)
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => {
      expect(screen.getByLabelText("Full PAN")).toBeInTheDocument();
    });

    // Fill in PAN and Aadhaar
    fireEvent.change(screen.getByLabelText("Full PAN"), { target: { value: "ABCDE1234F" } });
    fireEvent.change(screen.getByLabelText("Full Aadhaar"), { target: { value: "123412341234" } });

    // Advance to step 3 (Documents)
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => {
      expect(screen.getByLabelText("PAN Drive link")).toBeInTheDocument();
    });

    // Fill PAN and Aadhaar drive links but leave signed joining letter empty
    fireEvent.change(screen.getByLabelText("PAN Drive link"), {
      target: { value: "https://drive.google.com/pan" },
    });
    fireEvent.change(screen.getByLabelText("Aadhaar Drive link"), {
      target: { value: "https://drive.google.com/aadhaar" },
    });

    // Advance to step 4 (Review)
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => {
      expect(screen.getByText("Submit onboarding")).toBeInTheDocument();
    });

    // Try to submit — should fail because signed joining letter is missing
    fireEvent.click(screen.getByText("Submit onboarding"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Please provide a link to the signed joining letter.",
      );
    });
  });

  // ── Test 4: Invite expired / inactive ────────────────────────────────────────
  it("shows invite-unavailable screen for expired invites", async () => {
    mockFetchInvite.mockResolvedValue({
      status: "expired",
      invite: { ...MOCK_INVITE, id: "invite-expired" },
    });

    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Invite unavailable")).toBeInTheDocument();
    });
  });

  // ── Test 5: Fetch error shows error screen ─────────────────────────────────
  it("shows invite-unavailable screen when fetch throws an error", async () => {
    mockFetchInvite.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Invite unavailable")).toBeInTheDocument();
    });

    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  // ── Test 6: Save & continue persists draft ────────────────────────────────
  it("persists draft when clicking save & continue", async () => {
    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Complete your onboarding")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save & continue"));

    await waitFor(() => {
      expect(mockSaveOnboardingDraft).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Draft saved");
    });
  });

  // ── Test 7: Submit completed wizard ───────────────────────────────────────
  it("submits the wizard when all required fields are filled", async () => {
    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Complete your onboarding")).toBeInTheDocument();
    });

    // Step 2
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => expect(screen.getByLabelText("Full PAN")).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText("Full PAN"), { target: { value: "ABCDE1234F" } });
    fireEvent.change(screen.getByLabelText("Full Aadhaar"), { target: { value: "123412341234" } });

    // Step 3
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => expect(screen.getByLabelText("PAN Drive link")).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText("PAN Drive link"), { target: { value: "link1" } });
    fireEvent.change(screen.getByLabelText("Aadhaar Drive link"), { target: { value: "link2" } });
    fireEvent.change(screen.getByLabelText("Signed Joining Letter (Drive link)"), { target: { value: "link3" } });

    // Step 4
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => expect(screen.getByText("Submit onboarding")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Submit onboarding"));

    await waitFor(() => {
      expect(mockSubmitOnboardingIntake).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Onboarding submitted for review");
      expect(screen.getByText("Your onboarding is under review")).toBeInTheDocument();
    });
  });

  // ── Test 8: Back button functionality ─────────────────────────────────────
  it("navigates back to the previous step", async () => {
    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => expect(screen.getByText("Complete your onboarding")).toBeInTheDocument());

    // Step 2
    fireEvent.click(screen.getByText("Save & continue"));
    await waitFor(() => expect(screen.getByLabelText("Full PAN")).toBeInTheDocument());

    // Back to Step 1
    fireEvent.click(screen.getByText("Back"));
    await waitFor(() => expect(screen.getByText("Invite summary")).toBeInTheDocument());
  });

  it("signs out from the waiting screen", async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    await act(async () => {
      render(<OnboardingWizard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Onboarding pending")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mockAuthSignOut).toHaveBeenCalledWith("/login");
    });
  });
});
