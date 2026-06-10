import { MockSupabaseClient } from "./mock-client";

export function createAdminClient() {
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
