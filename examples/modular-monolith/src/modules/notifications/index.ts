import { CommandBus, QueryBus } from "@zudojs/cqrs";
import type { EventBus } from "@zudojs/events";
import type { NotificationRepository } from "../../repositories/notification.repository.js";
import type { ArticleRepository } from "../../repositories/article.repository.js";
import type { UserRepository } from "../../repositories/user.repository.js";
import { CreateNotificationHandler } from "./commands/create-notification/create-notification.handler.js";
import { MarkNotificationReadHandler } from "./commands/mark-notification-read/mark-notification-read.handler.js";
import { GetNotificationsHandler } from "./queries/get-notifications/get-notifications.handler.js";

export interface NotificationsModuleConfig {
  readonly notifications: NotificationRepository;
  readonly articles: ArticleRepository;
  readonly users: UserRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
}

export function registerNotificationsModule(
  config: NotificationsModuleConfig,
): void {
  const { notifications, commandBus, queryBus, events } = config;

  const createHandler = new CreateNotificationHandler(notifications);
  const markReadHandler = new MarkNotificationReadHandler(notifications);
  const getHandler = new GetNotificationsHandler(notifications);

  commandBus.register("notifications.create", createHandler);
  commandBus.register("notifications.mark-read", markReadHandler);

  queryBus.register("notifications.get", getHandler);

  events.on("article.created", async (event) => {
    const payload = event.payload as { authorId: string; title: string };
    await createHandler.execute({
      type: "notifications.create",
      data: {
        userId: payload.authorId as any,
        type: "article.created",
        title: "Article created",
        message: `Your article "${payload.title}" has been created as a draft`,
      },
    } as any);
  });

  events.on("article.published", async (event) => {
    const payload = event.payload as { authorId: string; title: string };
    await createHandler.execute({
      type: "notifications.create",
      data: {
        userId: payload.authorId as any,
        type: "article.published",
        title: "Article published",
        message: `Your article "${payload.title}" has been published`,
      },
    } as any);
  });

  events.on("comment.created", async (event) => {
    const payload = event.payload as { authorId: string; articleId: string };
    await createHandler.execute({
      type: "notifications.create",
      data: {
        userId: payload.authorId as any,
        type: "comment.created",
        title: "New comment",
        message: `A new comment was added to your article`,
      },
    } as any);
  });

  events.on("topic.followed", async (event) => {
    const payload = event.payload as { userId: string; topicName: string };
    await createHandler.execute({
      type: "notifications.create",
      data: {
        userId: payload.userId as any,
        type: "topic.followed",
        title: "Topic followed",
        message: `You are now following "${payload.topicName}"`,
      },
    } as any);
  });
}
