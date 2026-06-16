const mockSignOut = jest.fn();
const mockCookiesSet = jest.fn();
const mockCreateServerClient = jest.fn();
const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => ({
      url: url.toString(),
      status: 307,
      cookies: {
        set: mockCookiesSet,
      },
    }),
  },
}));

describe("/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    mockCreateServerClient.mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    });
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
  });

  it("signs out and redirects to login", async () => {
    const { GET } = await import("../route");
    const response = await GET(
      {
        url: "http://localhost/logout?redirect=/login",
        nextUrl: {
          searchParams: new URLSearchParams({ redirect: "/login" }),
        },
        cookies: {
          getAll: () => [],
        },
      } as never,
    );

    expect(mockCreateServerClient).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
    expect(response).toMatchObject({
      status: 307,
      url: "http://localhost/login",
    });
  });
});
