import { AppQuery } from "../../../../../shared/application/query.js";
import type { UserId } from "../../../../../shared/domain/ids.js";
import type { User } from "../../../domain/entities/user.entity.js";

export class GetUserQuery extends AppQuery<User | null> {
  public readonly type = "users.getById" as const;
  constructor(public readonly id: UserId) {
    super();
  }
}
