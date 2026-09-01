import { AppCommand } from "../../../../../shared/application/command.js";
import type { UserId } from "../../../../../shared/domain/ids.js";
import type { UserRole } from "../../../domain/entities/user.entity.js";

export class CreateUserCommand extends AppCommand {
  public readonly type = "users.create" as const;
  constructor(
    public readonly id: UserId,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
  ) {
    super();
  }
}
