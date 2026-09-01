import type { CreateUserCommand } from "./create-user.command.js";
import type { UserRepository } from "../../../domain/repositories/user.repository.js";
import { User } from "../../../domain/entities/user.entity.js";

export class CreateUserHandler {
  constructor(private readonly users: UserRepository) {}

  public async execute(command: CreateUserCommand): Promise<void> {
    const existing = await this.users.findByEmail(command.email);
    if (existing) throw new Error("A user with this email already exists.");
    const user = User.create(
      command.id,
      command.email,
      command.name,
      command.passwordHash,
      command.role,
    );
    await this.users.save(user);
  }
}
