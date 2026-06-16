export type BrandStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website_url: string | null;
  description: string | null;
  status: BrandStatus;
  created_by: string | null;
  assigned_manager_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandSummary extends BrandRow {
  eod_count: number;
  latest_update_at: string | null;
}
