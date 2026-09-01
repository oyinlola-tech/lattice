import type { NotificationId, UserId } from "../types/index.js";
import type { NotificationType, NotificationStatus } from "../enums/index.js";

export interface NotificationModel {
  readonly id: NotificationId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
  readonly readAt: Date | null;
}
