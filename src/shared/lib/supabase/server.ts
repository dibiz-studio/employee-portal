import { cookies } from "next/headers";
import { MockSupabaseClient } from "./mock-client";

export async function createClient() {
  const cookieStore = await cookies();

  const cookieManager = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options?: { path?: string; maxAge?: number }) {
      try {
        cookieStore.set(name, value, {
          path: options?.path,
          maxAge: options?.maxAge,
        });
      } catch {
        // Safe to ignore in Server Components (handled by middleware write)
      }
    },
    delete(name: string) {
      try {
        cookieStore.delete(name);
      } catch {
        // Safe to ignore in Server Components (handled by middleware write)
      }
    },
  };

  return new MockSupabaseClient(cookieManager);
}
