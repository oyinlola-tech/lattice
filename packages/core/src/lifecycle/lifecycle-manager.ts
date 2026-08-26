import type { Logger } from "../logging/logger.js";
import {
  hasDestroyHook,
  hasInitializeHook,
  hasStartHook,
  hasStopHook,
  type LifecycleHook,
} from "./lifecycle-hook.js";
import {
  Lifecycle,
  LifecycleState,
  type LifecycleParticipant,
} from "./lifecycle.js";

/**
 * Anything that can participate in the managed application lifecycle.
 */
export type ManagedLifecycleComponent =
  | LifecycleParticipant
  | LifecycleHook;

/**
 * Options for LifecycleManager.
 */
export interface LifecycleManagerOptions {
  /**
   * Logger used for lifecycle diagnostics.
   */
  readonly logger?: Logger;

  /**
   * Whether shutdown should continue when a component fails.
   *
   * Defaults to true.
   */
  readonly continueOnShutdownError?: boolean;
}

/**
 * Coordinates lifecycle hooks and lifecycle participants.
 *
 * LifecycleManager is the primary API for application-level lifecycle
 * management. It handles the initialization, startup, shutdown, and
 * destruction of application-wide resources.
 *
 * For module-level lifecycle management, see ModuleLifecycleManager
 * in the modules package. ModuleLifecycleManager handles the lifecycle
 * of individual modules and their dependencies.
 *
 * The two lifecycle systems work together:
 * 1. ApplicationLifecycleManager manages application-wide resources
 * 2. ModuleLifecycleManager manages module-specific resources
 * 3. The Runtime orchestrates both during startup and shutdown
 */
export class LifecycleManager {
  private readonly lifecycle: Lifecycle;

  private readonly components: ManagedLifecycleComponent[] = [];

  private readonly logger?: Logger;

  private readonly continueOnShutdownError: boolean;

  public constructor(
    options: LifecycleManagerOptions = {},
  ) {
    this.logger = options.logger;

    this.continueOnShutdownError =
      options.continueOnShutdownError ?? true;

    this.lifecycle = new Lifecycle({
      logger: this.logger,
      continueOnShutdownError:
        this.continueOnShutdownError,
    });
  }

  /**
   * Returns the current application lifecycle state.
   */
  public getState(): LifecycleState {
    return this.lifecycle.getState();
  }

  /**
   * Registers a lifecycle component.
   */
  public register(
    component: ManagedLifecycleComponent,
  ): void {
    this.components.push(component);

    /**
     * Full lifecycle participants are also registered with the
     * lower-level lifecycle registry.
     */
    if (this.isLifecycleParticipant(component)) {
      this.lifecycle.register(component);
    }
  }

  /**
   * Initializes all registered components.
   */
  public async initialize(): Promise<void> {
    if (this.getState() !== LifecycleState.CREATED) {
      return;
    }

    this.logger?.debug(
      "Lifecycle manager initialization started",
    );

    try {
      for (const component of this.components) {
        if (hasInitializeHook(component)) {
          await this.runInitializeHook(component);
        }
      }

      /**
       * Full lifecycle participants have already been registered
       * with Lifecycle. Their initialize() methods are executed by
       * the lower-level lifecycle.
       */
      await this.lifecycle.initialize();

      this.logger?.debug(
        "Lifecycle manager initialization completed",
      );
    } catch (error) {
      this.logger?.error(
        "Lifecycle manager initialization failed",
        error,
      );

      throw error;
    }
  }

  /**
   * Starts all registered components.
   */
  public async start(): Promise<void> {
    if (this.getState() === LifecycleState.CREATED) {
      await this.initialize();
    }

    this.logger?.debug(
      "Lifecycle manager startup started",
    );

    try {
      /**
       * Run hook-based components first.
       */
      for (const component of this.components) {
        if (hasStartHook(component)) {
          await this.runStartHook(component);
        }
      }

      /**
       * Start full lifecycle participants.
       */
      await this.lifecycle.start();

      this.logger?.debug(
        "Lifecycle manager startup completed",
      );
    } catch (error) {
      this.logger?.error(
        "Lifecycle manager startup failed",
        error,
      );

      throw error;
    }
  }

  /**
   * Stops all registered components.
   *
   * Components are stopped in reverse registration order.
   */
  public async stop(): Promise<void> {
    const errors: unknown[] = [];

    this.logger?.debug(
      "Lifecycle manager shutdown started",
    );

    /**
     * Stop hook-based components in reverse order.
     */
    for (
      let index = this.components.length - 1;
      index >= 0;
      index -= 1
    ) {
      const component = this.components[index];

      if (!hasStopHook(component)) {
        continue;
      }

      try {
        await this.runStopHook(component);
      } catch (error) {
        errors.push(error);

        if (!this.continueOnShutdownError) {
          break;
        }
      }
    }

    /**
     * Stop full lifecycle participants.
     */
    try {
      await this.lifecycle.stop();
    } catch (error) {
      errors.push(error);
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "Lifecycle shutdown completed with errors.",
      );
    }

    this.logger?.debug(
      "Lifecycle manager shutdown completed",
    );
  }

  /**
   * Destroys all registered components.
   *
   * Destruction hooks run in reverse registration order.
   */
  public async destroy(): Promise<void> {
    const errors: unknown[] = [];

    this.logger?.debug(
      "Lifecycle manager destruction started",
    );

    for (
      let index = this.components.length - 1;
      index >= 0;
      index -= 1
    ) {
      const component = this.components[index];

      if (!hasDestroyHook(component)) {
        continue;
      }

      try {
        await this.runDestroyHook(component);
      } catch (error) {
        errors.push(error);

        if (!this.continueOnShutdownError) {
          break;
        }
      }
    }

    /**
     * Dispose full lifecycle participants.
     */
    try {
      await this.lifecycle.dispose();
    } catch (error) {
      errors.push(error);
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "Lifecycle destruction completed with errors.",
      );
    }

    this.logger?.debug(
      "Lifecycle manager destruction completed",
    );
  }

  /**
   * Performs a complete graceful shutdown.
   */
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

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        "Application shutdown completed with errors.",
      );
    }
  }

  /**
   * Returns all registered components.
   */
  public getComponents(): readonly ManagedLifecycleComponent[] {
    return [...this.components];
  }

  /**
   * Executes an initialization hook.
   */
  private async runInitializeHook(
    component: LifecycleHook,
  ): Promise<void> {
    this.logger?.debug(
      "Running lifecycle initialize hook",
      {
        component: this.getComponentName(component),
      },
    );

    await component.onInitialize?.();
  }

  /**
   * Executes a start hook.
   */
  private async runStartHook(
    component: LifecycleHook,
  ): Promise<void> {
    this.logger?.debug(
      "Running lifecycle start hook",
      {
        component: this.getComponentName(component),
      },
    );

    await component.onStart?.();
  }

  /**
   * Executes a stop hook.
   */
  private async runStopHook(
    component: LifecycleHook,
  ): Promise<void> {
    this.logger?.debug(
      "Running lifecycle stop hook",
      {
        component: this.getComponentName(component),
      },
    );

    await component.onStop?.();
  }

  /**
   * Executes a destroy hook.
   */
  private async runDestroyHook(
    component: LifecycleHook,
  ): Promise<void> {
    this.logger?.debug(
      "Running lifecycle destroy hook",
      {
        component: this.getComponentName(component),
      },
    );

    await component.onDestroy?.();
  }

  /**
   * Determines whether a component is a full lifecycle participant.
   */
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

  /**
   * Returns a readable component name.
   */
  private getComponentName(
    component: ManagedLifecycleComponent,
  ): string {
    if (
      "name" in component &&
      typeof component.name === "string"
    ) {
      return component.name;
    }

    if (
      typeof component === "object" &&
      component !== null &&
      "constructor" in component &&
      typeof component.constructor === "function"
    ) {
      return component.constructor.name;
    }

    return "anonymous";
  }
}