import { createClient } from "@/shared/lib/supabase/server";
import { asSingleRelation } from "@/shared/lib/utils";

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

type AuditLogRowWithProfile = AuditLogRow & {
  profiles?: { full_name?: string }[];
};

export async function getAuditLogs(limit = 100): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at, profiles!audit_logs_actor_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: AuditLogRowWithProfile) => ({
    id: row.id,
    actor_id: row.actor_id,
    actor_name: asSingleRelation(row.profiles)?.full_name ?? "System",
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    old_values: row.old_values as Record<string, unknown> | null,
    new_values: row.new_values as Record<string, unknown> | null,
    ip_address: row.ip_address,
    created_at: row.created_at,
  }));
}
