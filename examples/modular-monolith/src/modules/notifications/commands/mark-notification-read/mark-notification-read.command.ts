import { Command } from "@lattice/cqrs";
import type { NotificationId } from "../../../../types/index.js";

export class MarkNotificationReadCommand extends Command<"notifications.mark-read"> {
  public readonly notificationId: NotificationId;

  public constructor(notificationId: NotificationId) {
    super("notifications.mark-read");
    this.notificationId = notificationId;
  }
}
