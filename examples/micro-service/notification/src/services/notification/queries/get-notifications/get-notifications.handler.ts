import { QueryHandler } from "@oyinlola141/lattice-cqrs";
import type { CqrsContext } from "@oyinlola141/lattice-cqrs";
import {
  GetNotificationsQuery,
  GET_NOTIFICATIONS_QUERY,
} from "./get-notifications.query.js";
import type { INotificationRepository } from "../../../../interfaces/index.js";
import type { NotificationModel } from "../../../../models/index.js";

export class GetNotificationsQueryHandler extends QueryHandler<
  GetNotificationsQuery,
  readonly NotificationModel[]
> {
  public readonly queryType = GET_NOTIFICATIONS_QUERY;

  private readonly repository: INotificationRepository;

  constructor(repository: INotificationRepository) {
    super();
    this.repository = repository;
  }

  public async execute(
    query: GetNotificationsQuery,
    _context?: CqrsContext,
  ): Promise<readonly NotificationModel[]> {
    return this.repository.findAll(query.userId);
  }
}
