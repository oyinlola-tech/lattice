import { CommandBus, QueryBus } from "@zudolib/cqrs";
import type { UserRepository } from "./domain/repositories/user.repository.js";
import { InMemoryUserRepository } from "./infrastructure/repositories/in-memory-user.repository.js";
import { CreateUserHandler } from "./application/commands/create-user/create-user.handler.js";
import { GetUserHandler } from "./application/queries/get-user/get-user.handler.js";

export class UsersModule {
  public readonly id = "users";
  private readonly users: UserRepository;
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor() {
    this.users = new InMemoryUserRepository();
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
  }

  public initialize(): void {
    const createHandler = new CreateUserHandler(this.users);
    const getHandler = new GetUserHandler(this.users);
    this.commandBus.register(
      "users.create",
      createHandler.execute.bind(createHandler),
    );
    this.queryBus.register(
      "users.getById",
      getHandler.execute.bind(getHandler),
    );
  }

  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
  public getQueryBus(): QueryBus {
    return this.queryBus;
  }
  public getUserRepository(): UserRepository {
    return this.users;
  }
}
