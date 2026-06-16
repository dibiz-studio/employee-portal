import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { MockSupabaseClient } from "./mock-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createAdminClient() {
  if (supabaseUrl && supabaseServiceRoleKey) {
    return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  const cookieManager = {
    get: () => undefined,
    set: () => {},
    delete: () => {},
  };
  return new MockSupabaseClient(cookieManager);
}

export function hasAdminClient() {
  return true;
}
