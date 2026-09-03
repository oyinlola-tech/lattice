import { CommandBus } from "@zudo/cqrs";
import { AppCommand } from "../../shared/application/command.js";
import { createUserId } from "../../shared/domain/ids.js";
import type { UserRepository } from "../users/domain/repositories/user.repository.js";
import { User, UserRole } from "../users/domain/entities/user.entity.js";

export interface RegisterResult {
  readonly userId: string;
  readonly email: string;
  readonly name: string;
}

export class RegisterCommand extends AppCommand {
  public readonly type = "identity.register" as const;
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
  ) {
    super();
  }
}

export class RegisterHandler {
  constructor(private readonly users: UserRepository) {}

  public async execute(command: RegisterCommand): Promise<RegisterResult> {
    const existing = await this.users.findByEmail(command.email);
    if (existing) throw new Error("A user with this email already exists.");
    const id = createUserId(crypto.randomUUID());
    const hash = await this.hashPassword(command.password);
    const user = User.create(
      id,
      command.email,
      command.name,
      hash,
      UserRole.MEMBER,
    );
    await this.users.save(user);
    return { userId: user.id, email: user.email, name: user.name };
  }

  private async hashPassword(password: string): Promise<string> {
    const data = new TextEncoder().encode(password + "lattice-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export class IdentityModule {
  public readonly id = "identity";
  private readonly commandBus: CommandBus;

  public constructor() {
    this.commandBus = new CommandBus();
  }

  public initialize(users: UserRepository): void {
    const handler = new RegisterHandler(users);
    this.commandBus.register(
      "identity.register",
      handler.execute.bind(handler),
    );
  }

  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
}
