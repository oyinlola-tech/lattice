import { CommandHandler } from "@zudo/cqrs";
import type { UpdateProfileCommand } from "./update-profile.command.js";
import type { UserRepository } from "../../../../repositories/user.repository.js";
import { NotFoundError } from "../../../../errors/index.js";

export class UpdateProfileHandler extends CommandHandler<
  UpdateProfileCommand,
  void
> {
  public readonly commandType = "identity.update-profile" as const;

  private readonly users: UserRepository;

  public constructor(users: UserRepository) {
    super();
    this.users = users;
  }

  public async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.users.findById(command.userId);
    if (!user) {
      throw new NotFoundError("User", command.userId);
    }

    await this.users.update(command.userId, {
      ...(command.data.name !== undefined && { name: command.data.name }),
      ...(command.data.bio !== undefined && { bio: command.data.bio }),
      ...(command.data.avatar !== undefined && { avatar: command.data.avatar }),
    });
  }
}
