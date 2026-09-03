import { CommandHandler } from "@zudo/cqrs";
import type { RegisterUserCommand } from "./register-user.command.js";
import type { UserRepository } from "../../../../repositories/user.repository.js";
import { ConflictError } from "../../../../errors/index.js";
import type { UserModel } from "../../../../models/user.model.js";
import type { UserId } from "../../../../types/index.js";
import { UserRole } from "../../../../enums/index.js";
import { createUserId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";

export class RegisterUserHandler extends CommandHandler<
  RegisterUserCommand,
  UserModel
> {
  public readonly commandType = "identity.register-user" as const;

  private readonly users: UserRepository;

  public constructor(users: UserRepository) {
    super();
    this.users = users;
  }

  public async execute(command: RegisterUserCommand): Promise<UserModel> {
    const existing = await this.users.findByEmail(command.data.email);
    if (existing) {
      throw new ConflictError(
        `A user with email "${command.data.email}" already exists`,
      );
    }

    const now = new Date();
    const user: UserModel = {
      id: createUserId(randomUUID()),
      email: command.data.email,
      name: command.data.name,
      bio: command.data.bio ?? "",
      avatar: "/avatars/default.png",
      role: UserRole.USER,
      createdAt: now,
      updatedAt: now,
    };

    await this.users.save(user);
    return user;
  }
}
