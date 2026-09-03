import { Query } from "@zudo/cqrs";
import type { UserId } from "../../../../types/index.js";

export class GetNotificationsQuery extends Query<"notifications.get"> {
  public readonly userId: UserId;

  public constructor(userId: UserId) {
    super("notifications.get");
    this.userId = userId;
  }
}
