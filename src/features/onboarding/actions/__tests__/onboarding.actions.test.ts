import { createOnboardingInviteAction } from "../onboarding.actions";
import { getServerProfile } from "../../../../features/auth/services/auth-server.service";
import { createClient } from "../../../../shared/lib/supabase/server";

// Mock dependencies
jest.mock("../../../../features/auth/services/auth-server.service", () => ({
  getServerProfile: jest.fn(),
}));

jest.mock("../../../../shared/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("createOnboardingInviteAction", () => {
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockMaybeSingle = jest.fn();
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock chain
    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    (createClient as jest.Mock).mockResolvedValue({
      from: mockFrom,
    });
  });

  it("returns error if user is not authenticated", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue(null);

    const result = await createOnboardingInviteAction({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
    });

    expect(result.error).toBe("You do not have permission to create invites.");
  });

  it("returns error if user does not have permission", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({ role: "EMPLOYEE" });

    const result = await createOnboardingInviteAction({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
    });

    expect(result.error).toBe("You do not have permission to create invites.");
  });

  it("creates invite successfully for HR user", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({ id: "hr-id", role: "HR" });
    mockInsert.mockResolvedValue({ error: null });

    const result = await createOnboardingInviteAction({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
      estimated_stipend: 50000,
      joining_letter_drive_url: "https://drive.google.com/letter",
    });

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.inviteUrl).toContain("/onboarding/");

    // Verify insert payload
    expect(mockFrom).toHaveBeenCalledWith("onboarding_invites");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
      created_by: "hr-id",
      estimated_stipend: 50000,
      joining_letter_file_path: "https://drive.google.com/letter",
      invite_token_hash: expect.any(String),
    }));
  });

  it("handles manager lookup correctly", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({ id: "hr-id", role: "HR" });
    mockMaybeSingle.mockResolvedValue({ data: { full_name: "Manager Name" } });
    mockInsert.mockResolvedValue({ error: null });

    const result = await createOnboardingInviteAction({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
      assigned_manager_id: "mgr-id",
    });

    expect(result.success).toBe(true);
    expect(mockEq).toHaveBeenCalledWith("id", "mgr-id");
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      assigned_manager_id: "mgr-id",
      metadata: expect.objectContaining({
        manager_name: "Manager Name",
      }),
    }));
  });

  it("returns error if database insert fails", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({ id: "hr-id", role: "HR" });
    mockInsert.mockResolvedValue({ error: { message: "DB Error" } });

    const result = await createOnboardingInviteAction({
      invitee_email: "test@example.com",
      invitee_full_name: "Test User",
      target_role: "EMPLOYEE",
    });

    expect(result.error).toBe("DB Error");
    expect(result.success).toBeUndefined();
  });
});
