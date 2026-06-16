import { createBrowserClient } from "@supabase/ssr";
import { MockSupabaseClient } from "./mock-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  // Use real Supabase when env vars are configured (local + production)
  if (supabaseUrl && supabaseAnonKey) {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  // Fallback to mock client for offline/no-env development
  const cookieManager = {
    get(name: string) {
      if (typeof document === "undefined") return undefined;
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            name.replace(/([\.$?*|{}\(\)\[\]\\\\/\+^])/g, "\\$1") +
            "=([^;]*)",
        ),
      );
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    set(name: string, value: string, options?: { path?: string; maxAge?: number }) {
      if (typeof document === "undefined") return;
      let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      if (options?.path) updatedCookie += "; path=" + options.path;
      if (options?.maxAge) updatedCookie += "; max-age=" + options.maxAge;
      document.cookie = updatedCookie;
    },
    delete(name: string) {
      if (typeof document === "undefined") return;
      document.cookie = name + "=; max-age=-1; path=/";
    },
  };

  return new MockSupabaseClient(cookieManager);
}
