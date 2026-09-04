import { CommandHandler } from "@zudojs/cqrs";
import type { CreateNotificationCommand } from "./create-notification.command.js";
import type { NotificationRepository } from "../../../../repositories/notification.repository.js";
import type { NotificationModel } from "../../../../models/notification.model.js";
import type { NotificationId } from "../../../../types/index.js";
import {
  NotificationStatus,
  NotificationType,
} from "../../../../enums/index.js";
import { createNotificationId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";

export class CreateNotificationHandler extends CommandHandler<
  CreateNotificationCommand,
  NotificationModel
> {
  public readonly commandType = "notifications.create" as const;

  private readonly notifications: NotificationRepository;

  public constructor(notifications: NotificationRepository) {
    super();
    this.notifications = notifications;
  }

  public async execute(
    command: CreateNotificationCommand,
  ): Promise<NotificationModel> {
    const now = new Date();
    const notification: NotificationModel = {
      id: createNotificationId(randomUUID()),
      userId: command.data.userId,
      type: command.data.type as NotificationType,
      title: command.data.title,
      message: command.data.message,
      status: NotificationStatus.UNREAD,
      metadata: command.data.metadata ?? {},
      createdAt: now,
      readAt: null,
    };

    await this.notifications.save(notification);
    return notification;
  }
}
