import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MockSupabaseClient } from "./mock-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  // Use real Supabase when env vars are configured (local + Vercel)
  if (supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Safe to ignore in Server Components – middleware handles writes
          }
        },
      },
    });
  }

  // Fallback to mock client when no env vars (offline dev)
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
        // Safe to ignore in Server Components
      }
    },
    delete(name: string) {
      try {
        cookieStore.delete(name);
      } catch {
        // Safe to ignore
      }
    },
  };

  return new MockSupabaseClient(cookieManager);
}
