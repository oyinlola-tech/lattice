import type { Logger } from "../../logging/core/logger.js";
import {
  hasDestroyHook,
  hasInitializeHook,
  hasStartHook,
  hasStopHook,
  type LifecycleHook,
} from "../core/lifecycleHook.hook.js";
import {
  Lifecycle,
  LifecycleState,
  type LifecycleParticipant,
} from "../core/lifecycle.js";

/** Anything that can participate in the managed application lifecycle. */
export type ManagedLifecycleComponent = LifecycleParticipant | LifecycleHook;

/** Options for LifecycleManager. */
export interface LifecycleManagerOptions {
  readonly logger?: Logger;
  readonly continueOnShutdownError?: boolean;
}

/**
 * Coordinates lifecycle hooks and lifecycle participants.
 * Primary API for application-level lifecycle management.
 */
export class LifecycleManager {
  private readonly lifecycle: Lifecycle;
  private readonly components: ManagedLifecycleComponent[] = [];
  private readonly logger?: Logger;
  private readonly continueOnShutdownError: boolean;

  public constructor(options: LifecycleManagerOptions = {}) {
    this.logger = options.logger;
    this.continueOnShutdownError = options.continueOnShutdownError ?? true;
    this.lifecycle = new Lifecycle({
      logger: this.logger,
      continueOnShutdownError: this.continueOnShutdownError,
    });
  }

  public getState(): LifecycleState {
    return this.lifecycle.getState();
  }
  public getComponents(): readonly ManagedLifecycleComponent[] {
    return [...this.components];
  }

  public register(component: ManagedLifecycleComponent): void {
    this.components.push(component);
    if (this.isLifecycleParticipant(component))
      this.lifecycle.register(component);
  }

  public async initialize(): Promise<void> {
    if (this.getState() !== LifecycleState.CREATED) return;
    this.logger?.debug("Lifecycle manager initialization started");
    try {
      for (const component of this.components) {
        if (hasInitializeHook(component))
          await this.runHook(component, "onInitialize", "initialize");
      }
      await this.lifecycle.initialize();
      this.logger?.debug("Lifecycle manager initialization completed");
    } catch (error) {
      this.logger?.error("Lifecycle manager initialization failed", error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.getState() === LifecycleState.CREATED) await this.initialize();
    this.logger?.debug("Lifecycle manager startup started");
    try {
      for (const component of this.components) {
        if (hasStartHook(component))
          await this.runHook(component, "onStart", "start");
      }
      await this.lifecycle.start();
      this.logger?.debug("Lifecycle manager startup completed");
    } catch (error) {
      this.logger?.error("Lifecycle manager startup failed", error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    const errors: unknown[] = [];
    this.logger?.debug("Lifecycle manager shutdown started");
    for (let i = this.components.length - 1; i >= 0; i--) {
      const component = this.components[i];
      if (!hasStopHook(component)) continue;
      try {
        await this.runHook(component, "onStop", "stop");
      } catch (error) {
        errors.push(error);
        if (!this.continueOnShutdownError) break;
      }
    }
    try {
      await this.lifecycle.stop();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length > 0)
      throw new AggregateError(
        errors,
        "Lifecycle shutdown completed with errors.",
      );
    this.logger?.debug("Lifecycle manager shutdown completed");
  }

  public async destroy(): Promise<void> {
    const errors: unknown[] = [];
    this.logger?.debug("Lifecycle manager destruction started");
    for (let i = this.components.length - 1; i >= 0; i--) {
      const component = this.components[i];
      if (!hasDestroyHook(component)) continue;
      try {
        await this.runHook(component, "onDestroy", "destroy");
      } catch (error) {
        errors.push(error);
        if (!this.continueOnShutdownError) break;
      }
    }
    try {
      await this.lifecycle.dispose();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length > 0)
      throw new AggregateError(
        errors,
        "Lifecycle destruction completed with errors.",
      );
    this.logger?.debug("Lifecycle manager destruction completed");
  }

  public async shutdown(): Promise<void> {
    const errors: unknown[] = [];
    try {
      await this.stop();
    } catch (error) {
      errors.push(error);
    }
    try {
      await this.destroy();
    } catch (error) {
      errors.push(error);
    }
    if (errors.length > 0)
      throw new AggregateError(
        errors,
        "Application shutdown completed with errors.",
      );
  }

  private async runHook(
    component: LifecycleHook,
    hook: "onInitialize" | "onStart" | "onStop" | "onDestroy",
    label: string,
  ): Promise<void> {
    this.logger?.debug(`Running lifecycle ${label} hook`, {
      component: this.getComponentName(component),
    });
    await component[hook]?.();
  }

  private isLifecycleParticipant(
    component: ManagedLifecycleComponent,
  ): component is LifecycleParticipant {
    return (
      typeof component === "object" &&
      component !== null &&
      "name" in component &&
      typeof component.name === "string"
    );
  }

  private getComponentName(component: ManagedLifecycleComponent): string {
    if ("name" in component && typeof component.name === "string")
      return component.name;
    if (
      typeof component === "object" &&
      component !== null &&
      "constructor" in component &&
      typeof component.constructor === "function"
    )
      return component.constructor.name;
    return "anonymous";
  }
}
