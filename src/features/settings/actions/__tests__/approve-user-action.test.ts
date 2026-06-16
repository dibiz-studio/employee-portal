import { approveUserAction } from "../approve-user-action";
import { getServerProfile } from "../../../auth/services/auth-server.service";
import { createClient } from "../../../../shared/lib/supabase/server";

jest.mock("../../../auth/services/auth-server.service", () => ({
  getServerProfile: jest.fn(),
}));

jest.mock("../../../../shared/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("approveUserAction", () => {
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockInsert = jest.fn();
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          update: mockUpdate.mockReturnValue({ eq: mockEq }),
        };
      }

      return {
        insert: mockInsert,
      };
    });

    mockEq.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });

    (createClient as jest.Mock).mockResolvedValue({
      from: mockFrom,
    });
  });

  it("rejects non-admin users", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({ role: "EMPLOYEE" });

    const result = await approveUserAction("user-1", "EMPLOYEE");

    expect(result.error).toBe("You do not have permission to approve users.");
  });

  it("approves a user and inserts a notification", async () => {
    (getServerProfile as jest.Mock).mockResolvedValue({
      id: "admin-1",
      role: "SUPER_ADMIN",
    });

    const result = await approveUserAction("user-1", "EMPLOYEE");

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      role: "EMPLOYEE",
      onboarding_status: "COMPLETED",
    });
    expect(mockEq).toHaveBeenCalledWith("id", "user-1");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        title: "Account approved",
      }),
    );
  });
});
