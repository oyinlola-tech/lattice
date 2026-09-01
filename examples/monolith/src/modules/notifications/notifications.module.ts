import type { DomainEvent } from "../../shared/domain/event.js";

export interface Notification {
  readonly id: string;
  readonly type: string;
  readonly message: string;
  readonly data: Record<string, unknown>;
  readonly createdAt: Date;
}

export class NotificationsModule {
  public readonly id = "notifications";
  private readonly notifications: Notification[] = [];

  public async handleEvents(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      const typeMap: Record<string, string> = {
        "order.created": "order_confirmation",
        "order.confirmed": "order_confirmed",
        "order.shipped": "order_shipped",
        "order.delivered": "order_delivered",
        "order.cancelled": "order_cancelled",
      };
      const notifType = typeMap[event.type];
      if (notifType) {
        const notification: Notification = {
          id: crypto.randomUUID(),
          type: notifType,
          message: `Order ${event.aggregateId}: ${notifType.replace(/_/g, " ")}`,
          data: event.data,
          createdAt: new Date(),
        };
        this.notifications.push(notification);
        console.log(
          `[Notifications] ${notification.type}: ${notification.message}`,
        );
      }
    }
  }

  public getNotifications(): readonly Notification[] {
    return [...this.notifications];
  }
}
