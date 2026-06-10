import { NextResponse, type NextRequest } from "next/server";
import { MockSupabaseClient } from "./mock-client";

export function createClient(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

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
