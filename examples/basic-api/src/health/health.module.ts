/**
 * Health module.
 *
 * Provides the /health endpoint.
 */

import { BaseModule } from "@lattice/core";
import { HealthController } from "./health.controller.js";

export class HealthModule extends BaseModule {
  public override readonly id = "health";
  public override readonly name = "Health Module";
  public override readonly version = "0.1.0";

  private controller: HealthController | undefined;

  public constructor() {
    super({ version: "0.1.0" });
  }

  public initialize(): void {
    this.controller = new HealthController();
  }

  public getController(): HealthController {
    if (!this.controller) {
      throw new Error("HealthModule has not been initialized.");
    }
    return this.controller;
  }
}
