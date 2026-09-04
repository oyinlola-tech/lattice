import type { CommandBus, QueryBus } from "@zudojs/cqrs";
import type { UserId } from "../types/index.js";
import { RegisterUserCommand } from "../modules/identity/commands/register-user/register-user.command.js";
import { UpdateProfileCommand } from "../modules/identity/commands/update-profile/update-profile.command.js";
import { GetUserQuery } from "../modules/identity/queries/get-user/get-user.query.js";

export class UserController {
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }

  public async register(body: { email: string; name: string; bio?: string }) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  public async getProfile(userId: UserId) {
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  public async updateProfile(
    userId: UserId,
    body: { name?: string; bio?: string; avatar?: string },
  ) {
    await this.commandBus.execute(new UpdateProfileCommand(userId, body));
    return { success: true };
  }
}
