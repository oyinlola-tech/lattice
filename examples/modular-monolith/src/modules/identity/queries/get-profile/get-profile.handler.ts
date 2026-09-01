import { QueryHandler } from "@oyinlola141/lattice-cqrs";
import type { GetProfileQuery } from "./get-profile.query.js";
import type { UserRepository } from "../../../../repositories/user.repository.js";
import type { UserModel } from "../../../../models/user.model.js";
import { NotFoundError } from "../../../../errors/index.js";

export class GetProfileHandler extends QueryHandler<
  GetProfileQuery,
  UserModel
> {
  public readonly queryType = "identity.get-profile" as const;

  private readonly users: UserRepository;

  public constructor(users: UserRepository) {
    super();
    this.users = users;
  }

  public async execute(query: GetProfileQuery): Promise<UserModel> {
    const user = await this.users.findById(query.userId);
    if (!user) {
      throw new NotFoundError("User", query.userId);
    }
    return user;
  }
}
