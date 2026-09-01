import { CommandHandler } from "@lattice/cqrs";
import type { MarkNotificationReadCommand } from "./mark-notification-read.command.js";
import type { NotificationRepository } from "../../../../repositories/notification.repository.js";

export class MarkNotificationReadHandler extends CommandHandler<MarkNotificationReadCommand, void> {
  public readonly commandType = "notifications.mark-read" as const;

  private readonly notifications: NotificationRepository;

  public constructor(notifications: NotificationRepository) {
    super();
    this.notifications = notifications;
  }

  public async execute(command: MarkNotificationReadCommand): Promise<void> {
    await this.notifications.markAsRead(command.notificationId);
  }
}
