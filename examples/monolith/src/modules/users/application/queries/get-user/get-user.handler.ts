import type { GetUserQuery } from "./get-user.query.js";
import type { UserRepository } from "../../../domain/repositories/user.repository.js";
import type { User } from "../../../domain/entities/user.entity.js";

export class GetUserHandler {
  constructor(private readonly users: UserRepository) {}
  public async execute(query: GetUserQuery): Promise<User | null> {
    return this.users.findById(query.id);
  }
}
