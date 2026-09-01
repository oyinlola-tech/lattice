import { Command } from "@oyinlola141/lattice-cqrs";
import type { CreateUserDto } from "../../../../dtos/index.js";

export class RegisterUserCommand extends Command<"identity.register-user"> {
  public readonly data: CreateUserDto;

  public constructor(data: CreateUserDto) {
    super("identity.register-user");
    this.data = data;
  }
}
