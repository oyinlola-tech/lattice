import { Query } from "@zudo/cqrs";
import type { UserId } from "../../../../types/index.js";

export class GetProfileQuery extends Query<"identity.get-profile"> {
  public readonly userId: UserId;

  public constructor(userId: UserId) {
    super("identity.get-profile");
    this.userId = userId;
  }
}
