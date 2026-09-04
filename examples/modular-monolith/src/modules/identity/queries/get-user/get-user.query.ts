import { Query } from "@zudojs/cqrs";
import type { UserId } from "../../../../types/index.js";

export class GetUserQuery extends Query<"identity.get-user"> {
  public readonly userId: UserId;

  public constructor(userId: UserId) {
    super("identity.get-user");
    this.userId = userId;
  }
}
