/**
 * Users module.
 *
 * Registers the UsersService and UsersController.
 */

import { BaseModule } from "@zudolib/core";
import { UsersService } from "./users.service.js";
import { UsersController } from "./users.controller.js";

export class UsersModule extends BaseModule {
  public override readonly id = "users";
  public override readonly name = "Users Module";
  public override readonly version = "0.1.0";

  private service: UsersService | undefined;
  private controller: UsersController | undefined;

  public constructor() {
    super({ version: "0.1.0" });
  }

  public initialize(): void {
    this.service = new UsersService();
    this.controller = new UsersController(this.service);
  }

  public getController(): UsersController {
    if (!this.controller) {
      throw new Error("UsersModule has not been initialized.");
    }
    return this.controller;
  }

  public getService(): UsersService {
    if (!this.service) {
      throw new Error("UsersModule has not been initialized.");
    }
    return this.service;
  }
}
