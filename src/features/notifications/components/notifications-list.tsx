"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions/notifications.actions";
import type { NotificationRow } from "@/features/notifications/services/notifications.service";
import { EmptyState } from "@/shared/components/data/empty-state";
import { StatusBadge } from "@/shared/components/data/status-badge";
import { Button } from "@/shared/components/ui/button";
import { formatDateTime } from "@/shared/lib/utils";

interface NotificationsListProps {
  notifications: NotificationRow[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(notifications);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const markRead = async (id: string) => {
    const result = await markNotificationReadAction(id);
    if (result.error) {
      toast.error(result.error);
      return false;
    }

    setItems((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification,
      ),
    );
    router.refresh();
    return true;
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      const result = await markAllNotificationsReadAction();
      if (result.error) throw new Error(result.error);
      setItems((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
      );
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

  if (items.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up. New alerts will appear here."
      />
    );
  }

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 ? (
        <Button variant="outline" onClick={markAllRead} disabled={loading}>
          Mark all as read ({unreadCount})
        </Button>
      ) : null}
      <ul className="divide-y divide-border rounded-lg border">
        {items.map((notification) => (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const link = notification.link;
                    if (!link) return;
                    if (!notification.is_read) {
                      const success = await markRead(notification.id);
                      if (!success) return;
                    }
                    router.push(link);
                  }}
                >
                  View
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
