import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MockSupabaseClient } from "./mock-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  // Use real Supabase when env vars are configured
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });
    return { supabase, response: supabaseResponse };
  }

  // Fallback mock client for offline dev
  const cookieManager = {
    get(name: string) {
      return request.cookies.get(name)?.value;
    },
    set(name: string, value: string, options?: { path?: string; maxAge?: number }) {
      request.cookies.set(name, value);
      supabaseResponse.cookies.set(name, value, {
        path: options?.path,
        maxAge: options?.maxAge,
      });
    },
    delete(name: string) {
      request.cookies.delete(name);
      supabaseResponse.cookies.delete(name);
    },
  };

  const supabase = new MockSupabaseClient(cookieManager);
  return { supabase, response: supabaseResponse };
}
