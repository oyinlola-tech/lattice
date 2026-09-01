import type { CommandBus } from "@lattice/cqrs";
import type { QueryBus } from "@lattice/cqrs";
import type { EventBus } from "@lattice/events";
import type { UserRepository } from "../repositories/index.js";
import { registerIdentityService } from "../services/index.js";

/**
 * Module loader that wires up all CQRS handlers.
 */
export function loadModules(params: {
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly eventBus: EventBus;
  readonly userRepository: UserRepository;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
}): void {
  registerIdentityService(params);
}
