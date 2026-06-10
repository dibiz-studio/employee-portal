import { MockSupabaseClient } from "./mock-client";

export function createClient() {
  const cookieManager = {
    get(name: string) {
      if (typeof document === "undefined") return undefined;
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
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
