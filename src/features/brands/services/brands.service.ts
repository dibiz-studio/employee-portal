import { createClient } from "@/shared/lib/supabase/server";

import type { BrandRow, BrandSummary } from "../types";

type BrandQueryRow = BrandRow;

type BrandUpdateCountRow = {
  brand_id: string | null;
  created_at: string;
};

export async function getActiveBrands(): Promise<BrandRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("status", "ACTIVE")
    .order("name");

  if (error) throw error;
  return (data ?? []) as BrandRow[];
}

export async function getAllBrands(): Promise<BrandSummary[]> {
  const supabase = await createClient();
  const [brandsResult, updatesResult] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
    supabase
      .from("daily_updates")
      .select("brand_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (brandsResult.error) throw brandsResult.error;
  if (updatesResult.error) throw updatesResult.error;

  const counts = new Map<string, { eod_count: number; latest_update_at: string | null }>();
  for (const row of (updatesResult.data ?? []) as BrandUpdateCountRow[]) {
    if (!row.brand_id) continue;
    const entry = counts.get(row.brand_id) ?? {
      eod_count: 0,
      latest_update_at: null,
    };
    entry.eod_count += 1;
    entry.latest_update_at = entry.latest_update_at ?? row.created_at;
    counts.set(row.brand_id, entry);
  }

  return ((brandsResult.data ?? []) as BrandQueryRow[]).map((brand) => {
    const stats = counts.get(brand.id) ?? { eod_count: 0, latest_update_at: null };
    return {
      ...brand,
      eod_count: stats.eod_count,
      latest_update_at: stats.latest_update_at,
    };
  });
}
