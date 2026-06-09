import { useAuthStore } from "@/shared/stores/auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({ profile: null, isLoading: true });
  });

  it("setProfile updates profile and clears loading", () => {
    useAuthStore.getState().setProfile({
      id: "1",
      email: "test@dibizstudio.com",
      full_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "EMPLOYEE",
      phone: null,
      is_active: true,
      onboarding_status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const state = useAuthStore.getState();
    expect(state.profile?.avatar_url).toBe("https://example.com/avatar.jpg");
    expect(state.profile?.onboarding_status).toBe("PENDING");
    expect(state.isLoading).toBe(false);
  });

  it("clearAuth resets state", () => {
    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().profile).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
