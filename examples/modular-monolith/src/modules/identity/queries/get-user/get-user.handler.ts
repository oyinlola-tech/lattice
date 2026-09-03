import { QueryHandler } from "@zudolib/cqrs";
import type { GetUserQuery } from "./get-user.query.js";
import type { UserRepository } from "../../../../repositories/user.repository.js";
import type { UserModel } from "../../../../models/user.model.js";

export class GetUserHandler extends QueryHandler<
  GetUserQuery,
  UserModel | null
> {
  public readonly queryType = "identity.get-user" as const;

  private readonly users: UserRepository;

  public constructor(users: UserRepository) {
    super();
    this.users = users;
  }

  public async execute(query: GetUserQuery): Promise<UserModel | null> {
    return this.users.findById(query.userId);
  }
}
