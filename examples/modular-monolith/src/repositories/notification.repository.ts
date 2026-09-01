import { getDatabase } from "../databases/database.js";
import type { NotificationModel } from "../models/notification.model.js";
import type { NotificationId, UserId } from "../types/index.js";
import type { NotificationType, NotificationStatus } from "../enums/index.js";

export interface NotificationRepository {
  findById(id: NotificationId): Promise<NotificationModel | null>;
  findByUser(userId: UserId, status?: NotificationStatus): Promise<readonly NotificationModel[]>;
  save(notification: NotificationModel): Promise<void>;
  markAsRead(id: NotificationId): Promise<void>;
  markAllAsRead(userId: UserId): Promise<void>;
  countUnread(userId: UserId): Promise<number>;
}

export class SqliteNotificationRepository implements NotificationRepository {
  public async findById(id: NotificationId): Promise<NotificationModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToNotification(row) : null;
  }

  public async findByUser(userId: UserId, status?: NotificationStatus): Promise<readonly NotificationModel[]> {
    const db = getDatabase();
    let query = "SELECT * FROM notifications WHERE user_id = ?";
    const params: unknown[] = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return rows.map(mapRowToNotification);
  }

  public async save(notification: NotificationModel): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, status, metadata, created_at, read_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(notification.id, notification.userId, notification.type, notification.title, notification.message, notification.status, JSON.stringify(notification.metadata), notification.createdAt.toISOString(), notification.readAt?.toISOString() ?? null);
  }

  public async markAsRead(id: NotificationId): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE id = ?").run(id);
  }

  public async markAllAsRead(userId: UserId): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE notifications SET status = 'read', read_at = datetime('now') WHERE user_id = ? AND status = 'unread'").run(userId);
  }

  public async countUnread(userId: UserId): Promise<number> {
    const db = getDatabase();
    const row = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = 'unread'").get(userId) as { count: number };
    return row.count;
  }
}

function mapRowToNotification(row: Record<string, unknown>): NotificationModel {
  return {
    id: row["id"] as NotificationId,
    userId: row["user_id"] as UserId,
    type: row["type"] as NotificationType,
    title: row["title"] as string,
    message: row["message"] as string,
    status: row["status"] as NotificationStatus,
    metadata: JSON.parse(row["metadata"] as string) as Record<string, unknown>,
    createdAt: new Date(row["created_at"] as string),
    readAt: row["read_at"] ? new Date(row["read_at"] as string) : null,
  };
}
