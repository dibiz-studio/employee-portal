import { createHash } from "crypto";

import { GET } from "../route";

const mockMaybeSingle = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
  },
}));

jest.mock("../../../../../shared/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

describe("/api/onboarding/invite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  it("returns 400 when token is missing", async () => {
    const response = await GET({ url: "http://localhost/api/onboarding/invite" } as Request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing token" });
  });

  it("returns 404 when invite is not found", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await GET(
      { url: "http://localhost/api/onboarding/invite?token=test-token" } as Request,
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Invite not found" });
    expect(mockFrom).toHaveBeenCalledWith("onboarding_invites");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith(
      "invite_token_hash",
      createHash("sha256").update("test-token").digest("hex"),
    );
  });

  it("returns invite payload and active status for a valid invite", async () => {
    const now = new Date();
    const invite = {
      id: "invite-1",
      invitee_email: "new.joiner@dibizstudio.com",
      invitee_full_name: "New Joiner",
      target_role: "EMPLOYEE",
      expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      revoked_at: null,
      used_at: null,
    };

    mockMaybeSingle.mockResolvedValueOnce({ data: invite, error: null });

    const response = await GET(
      { url: "http://localhost/api/onboarding/invite?token=active-token" } as Request,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "active",
      invite,
    });
  });

  it("marks an expired invite correctly", async () => {
    const invite = {
      id: "invite-2",
      invitee_email: "old.joiner@dibizstudio.com",
      invitee_full_name: "Old Joiner",
      target_role: "EMPLOYEE",
      expires_at: "2024-01-01T00:00:00.000Z",
      revoked_at: null,
      used_at: null,
    };

    mockMaybeSingle.mockResolvedValueOnce({ data: invite, error: null });

    const response = await GET(
      { url: "http://localhost/api/onboarding/invite?token=expired-token" } as Request,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "expired",
      invite,
    });
  });
});
