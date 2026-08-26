import type { Logger } from "../logging/logger.js";
import type {
  LifecycleComponent,
  LifecycleRegistration,
} from "./lifecycle-registry.js";
import { LifecycleRegistry } from "./lifecycle-registry.js";

/**
 * Lifecycle scope state.
 *
 * A scope follows the same broad lifecycle as the application,
 * but maintains its own state independently.
 */
export const LifecycleScopeState = {
  CREATED: "created",
  INITIALIZING: "initializing",
  INITIALIZED: "initialized",
  STARTING: "starting",
  RUNNING: "running",
  STOPPING: "stopping",
  STOPPED: "stopped",
  FAILED: "failed",
} as const;

export type LifecycleScopeState =
  (typeof LifecycleScopeState)[keyof typeof LifecycleScopeState];

/**
 * Options used when creating a lifecycle scope.
 */
export interface LifecycleScopeOptions {
  /**
   * Unique or human-readable scope name.
   */
  readonly name: string;

  /**
   * Optional parent scope.
   *
   * A child scope can belong to an application or another module.
   */
  readonly parent?: LifecycleScope;

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
 * Represents an independently managed lifecycle boundary.
 *
 * A scope can represent:
 *
 * Application
 * Module
 * Plugin
 * Worker
 * Service
 * Feature
 */
export class LifecycleScope {
  private state: LifecycleScopeState =
    LifecycleScopeState.CREATED;

  private readonly name: string;

  private readonly parent?: LifecycleScope;

  private readonly logger?: Logger;

  private readonly continueOnShutdownError: boolean;

  private readonly registry =
    new LifecycleRegistry();

  private readonly children: LifecycleScope[] = [];

  public constructor(
    options: LifecycleScopeOptions,
  ) {
    this.name = options.name;
    this.parent = options.parent;
    this.logger = options.logger;

    this.continueOnShutdownError =
      options.continueOnShutdownError ?? true;

    if (this.parent) {
      this.parent.addChild(this);
    }
  }

  /**
   * Returns the scope name.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Returns the current scope state.
   */
  public getState(): LifecycleScopeState {
    return this.state;
  }

  /**
   * Returns the parent scope.
   */
  public getParent(): LifecycleScope | undefined {
    return this.parent;
  }

  /**
   * Returns child scopes.
   */
  public getChildren(): readonly LifecycleScope[] {
    return [...this.children];
  }

  /**
   * Registers a lifecycle component in this scope.
   */
  public register(
    component: LifecycleComponent,
    name?: string,
  ): LifecycleRegistration {
    if (
      this.state !== LifecycleScopeState.CREATED &&
      this.state !== LifecycleScopeState.INITIALIZED
    ) {
      throw new Error(
        `Cannot register component in lifecycle scope ` +
          `"${this.name}" while state is "${this.state}".`,
      );
    }

    return this.registry.register(
      component,
      name,
    );
  }

  /**
   * Unregisters a lifecycle component.
   */
  public unregister(
    id: string,
  ): boolean {
    return this.registry.unregister(id);
  }

  /**
   * Initializes this scope and all child scopes.
   */
  public async initialize(): Promise<void> {
    if (
      this.state === LifecycleScopeState.INITIALIZED ||
      this.state === LifecycleScopeState.RUNNING
    ) {
      return;
    }

    if (
      this.state !== LifecycleScopeState.CREATED
    ) {
      throw new Error(
        `Cannot initialize lifecycle scope ` +
          `"${this.name}" while state is "${this.state}".`,
      );
    }

    this.state =
      LifecycleScopeState.INITIALIZING;

    this.logger?.debug(
      "Initializing lifecycle scope",
      {
        scope: this.name,
      },
    );

    try {
      for (
        const registration of this.registry.getAll()
      ) {
        const component =
          registration.component;

        if (
          "onInitialize" in component &&
          typeof component.onInitialize === "function"
        ) {
          await component.onInitialize();
        } else if (
          "initialize" in component &&
          typeof component.initialize === "function"
        ) {
          await component.initialize();
        }
      }

      for (const child of this.children) {
        await child.initialize();
      }

      this.state =
        LifecycleScopeState.INITIALIZED;

      this.logger?.debug(
        "Lifecycle scope initialized",
        {
          scope: this.name,
        },
      );
    } catch (error) {
      this.state =
        LifecycleScopeState.FAILED;

      this.logger?.error(
        "Lifecycle scope initialization failed",
        error,
        {
          scope: this.name,
        },
      );

      throw error;
    }
  }

  /**
   * Starts this scope and all child scopes.
   */
  public async start(): Promise<void> {
    if (
      this.state === LifecycleScopeState.RUNNING
    ) {
      return;
    }

    if (
      this.state === LifecycleScopeState.CREATED
    ) {
      await this.initialize();
    }

    if (
      this.state !== LifecycleScopeState.INITIALIZED
    ) {
      throw new Error(
        `Cannot start lifecycle scope ` +
          `"${this.name}" while state is "${this.state}".`,
      );
    }

    this.state =
      LifecycleScopeState.STARTING;

    this.logger?.debug(
      "Starting lifecycle scope",
      {
        scope: this.name,
      },
    );

    try {
      for (
        const registration of this.registry.getAll()
      ) {
        const component =
          registration.component;

        if (
          "onStart" in component &&
          typeof component.onStart === "function"
        ) {
          await component.onStart();
        } else if (
          "start" in component &&
          typeof component.start === "function"
        ) {
          await component.start();
        }
      }

      for (const child of this.children) {
        await child.start();
      }

      this.state =
        LifecycleScopeState.RUNNING;

      this.logger?.debug(
        "Lifecycle scope started",
        {
          scope: this.name,
        },
      );
    } catch (error) {
      this.state =
        LifecycleScopeState.FAILED;

      this.logger?.error(
        "Lifecycle scope startup failed",
        error,
        {
          scope: this.name,
        },
      );

      throw error;
    }
  }

  /**
   * Stops this scope and all child scopes.
   *
   * Children are stopped before their parent.
   */
  public async stop(): Promise<void> {
    if (
      this.state === LifecycleScopeState.STOPPED
    ) {
      return;
    }

    if (
      this.state !== LifecycleScopeState.RUNNING &&
      this.state !== LifecycleScopeState.FAILED
    ) {
      throw new Error(
        `Cannot stop lifecycle scope ` +
          `"${this.name}" while state is "${this.state}".`,
      );
    }

    this.state =
      LifecycleScopeState.STOPPING;

    const errors: unknown[] = [];

    this.logger?.debug(
      "Stopping lifecycle scope",
      {
        scope: this.name,
      },
    );

    /**
     * Child scopes stop before their parent.
     */
    for (
      let index = this.children.length - 1;
      index >= 0;
      index -= 1
    ) {
      try {
        await this.children[index].stop();
      } catch (error) {
        errors.push(error);

        if (!this.continueOnShutdownError) {
          break;
        }
      }
    }

    /**
     * Components stop in reverse registration order.
     */
    if (
      errors.length === 0 ||
      this.continueOnShutdownError
    ) {
      const registrations =
        this.registry.getReverse();

      for (const registration of registrations) {
        const component =
          registration.component;

        try {
          if (
            "onStop" in component &&
            typeof component.onStop === "function"
          ) {
            await component.onStop();
          } else if (
            "stop" in component &&
            typeof component.stop === "function"
          ) {
            await component.stop();
          }
        } catch (error) {
          errors.push(error);

          this.logger?.error(
            "Lifecycle component failed to stop",
            error,
            {
              scope: this.name,
              component: registration.name,
            },
          );

          if (!this.continueOnShutdownError) {
            break;
          }
        }
      }
    }

    this.state =
      LifecycleScopeState.STOPPED;

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Lifecycle scope "${this.name}" stopped with errors.`,
      );
    }
  }

  /**
   * Destroys this scope and all child scopes.
   *
   * Destruction occurs in reverse hierarchy and registration order.
   */
  public async destroy(): Promise<void> {
    const errors: unknown[] = [];

    this.logger?.debug(
      "Destroying lifecycle scope",
      {
        scope: this.name,
      },
    );

    for (
      let index = this.children.length - 1;
      index >= 0;
      index -= 1
    ) {
      try {
        await this.children[index].destroy();
      } catch (error) {
        errors.push(error);

        if (!this.continueOnShutdownError) {
          break;
        }
      }
    }

    if (
      errors.length === 0 ||
      this.continueOnShutdownError
    ) {
      const registrations =
        this.registry.getReverse();

      for (const registration of registrations) {
        const component =
          registration.component;

        try {
          if (
            "onDestroy" in component &&
            typeof component.onDestroy === "function"
          ) {
            await component.onDestroy();
          } else if (
            "dispose" in component &&
            typeof component.dispose === "function"
          ) {
            await component.dispose();
          }
        } catch (error) {
          errors.push(error);

          this.logger?.error(
            "Lifecycle component failed to destroy",
            error,
            {
              scope: this.name,
              component: registration.name,
            },
          );

          if (!this.continueOnShutdownError) {
            break;
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Lifecycle scope "${this.name}" destroyed with errors.`,
      );
    }
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
        `Lifecycle scope "${this.name}" shutdown completed with errors.`,
      );
    }
  }

  /**
   * Returns all registrations belonging to this scope.
   */
  public getRegistrations(): readonly LifecycleRegistration[] {
    return this.registry.getAll();
  }

  /**
   * Adds a child scope.
   */
  private addChild(
    child: LifecycleScope,
  ): void {
    if (this.children.includes(child)) {
      return;
    }

    this.children.push(child);
  }
}