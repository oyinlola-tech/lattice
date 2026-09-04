import { QueryHandler } from "@zudojs/cqrs";
import type { GetNotificationsQuery } from "./get-notifications.query.js";
import type { NotificationRepository } from "../../../../repositories/notification.repository.js";
import type { NotificationModel } from "../../../../models/notification.model.js";

export interface NotificationsResult {
  readonly notifications: readonly NotificationModel[];
  readonly unreadCount: number;
}

export class GetNotificationsHandler extends QueryHandler<
  GetNotificationsQuery,
  NotificationsResult
> {
  public readonly queryType = "notifications.get" as const;

  private readonly notifications: NotificationRepository;

  public constructor(notifications: NotificationRepository) {
    super();
    this.notifications = notifications;
  }

  public async execute(
    query: GetNotificationsQuery,
  ): Promise<NotificationsResult> {
    const notifications = await this.notifications.findByUser(query.userId);
    const unreadCount = await this.notifications.countUnread(query.userId);

    return { notifications, unreadCount };
  }
}
