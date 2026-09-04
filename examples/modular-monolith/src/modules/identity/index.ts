import { CommandBus, QueryBus } from "@zudojs/cqrs";
import type { UserRepository } from "../../repositories/user.repository.js";
import { RegisterUserHandler } from "./commands/register-user/register-user.handler.js";
import { UpdateProfileHandler } from "./commands/update-profile/update-profile.handler.js";
import { GetUserHandler } from "./queries/get-user/get-user.handler.js";
import { GetProfileHandler } from "./queries/get-profile/get-profile.handler.js";

export interface IdentityModuleConfig {
  readonly users: UserRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
}

export function registerIdentityModule(config: IdentityModuleConfig): void {
  const { users, commandBus, queryBus } = config;

  const registerUserHandler = new RegisterUserHandler(users);
  const updateProfileHandler = new UpdateProfileHandler(users);
  const getUserHandler = new GetUserHandler(users);
  const getProfileHandler = new GetProfileHandler(users);

  commandBus.register("identity.register-user", registerUserHandler);
  commandBus.register("identity.update-profile", updateProfileHandler);

  queryBus.register("identity.get-user", getUserHandler);
  queryBus.register("identity.get-profile", getProfileHandler);
}
