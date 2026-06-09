"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { NotificationRow } from "@/features/notifications/services/notifications.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Button } from "@/shared/components/ui/button";
import { createClient } from "@/shared/lib/supabase/client";
import { formatDateTime } from "@/shared/lib/utils";

interface NotificationsListProps {
  notifications: NotificationRow[];
  userId: string;
}

export function NotificationsList({
  notifications,
  userId,
}: NotificationsListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    router.refresh();
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      toast.success("All notifications marked as read");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to mark all as read",
      );
    } finally {
      setLoading(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up. New alerts will appear here."
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 ? (
        <Button variant="outline" onClick={markAllRead} disabled={loading}>
          Mark all as read ({unreadCount})
        </Button>
      ) : null}
      <ul className="divide-y divide-border rounded-lg border">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between ${
              !notification.is_read ? "bg-muted/40" : ""
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={notification.type} label={notification.type} />
                {!notification.is_read ? (
                  <span className="text-xs font-medium text-primary">New</span>
                ) : null}
              </div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(notification.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              {notification.link ? (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={notification.link}
                    onClick={() => {
                      if (!notification.is_read) markRead(notification.id);
                    }}
                  >
                    View
                  </Link>
                </Button>
              ) : null}
              {!notification.is_read ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markRead(notification.id)}
                >
                  Mark read
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
