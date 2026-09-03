/**
 * Application root module.
 *
 * Imports and composes feature modules.
 */

import { BaseModule } from "@zudolib/core";
import { UsersModule } from "../users/users.module.js";
import { HealthModule } from "../health/health.module.js";

export class AppModule extends BaseModule {
  public override readonly id = "app";
  public override readonly name = "App Module";
  public override readonly version = "0.1.0";
  public override readonly dependencies = ["users", "health"];

  private usersModule: UsersModule | undefined;
  private healthModule: HealthModule | undefined;

  public constructor() {
    super({ version: "0.1.0", dependencies: ["users", "health"] });
  }

  public async initialize(): Promise<void> {
    this.usersModule = new UsersModule();
    this.healthModule = new HealthModule();

    this.usersModule.initialize();
    this.healthModule.initialize();
  }

  public async shutdown(): Promise<void> {
    // Cleanup resources if needed.
  }

  public getUsersController() {
    if (!this.usersModule) {
      throw new Error("AppModule has not been initialized.");
    }
    return this.usersModule.getController();
  }

  public getHealthController() {
    if (!this.healthModule) {
      throw new Error("AppModule has not been initialized.");
    }
    return this.healthModule.getController();
  }
}
