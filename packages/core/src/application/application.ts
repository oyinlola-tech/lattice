import type { ApplicationContext } from "./applicationContext.context.js";
import type { ApplicationState } from "./applicationState.state.js";
import type { Lifecycle } from "../lifecycle/core/lifecycle.js";
import type { Runtime } from "../runtime/runtime.js";

export interface ApplicationOptions {
  readonly context?: ApplicationContext;
  readonly lifecycle?: Lifecycle;
  readonly runtime?: Runtime;
}

export class Application {
  private readonly context?: ApplicationContext;
  private readonly lifecycle?: Lifecycle;
  private readonly runtime?: Runtime;

  private _state: ApplicationState;

  private constructor(options: ApplicationOptions = {}) {
    this.context = options.context;
    this.lifecycle = options.lifecycle;
    this.runtime = options.runtime;

    this._state = "created";
  }

  public static async create(
    options: ApplicationOptions = {},
  ): Promise<Application> {
    const application = new Application(options);

    await application.initialize();

    return application;
  }

  public get state(): ApplicationState {
    return this._state;
  }

  public get applicationContext(): ApplicationContext | undefined {
    return this.context;
  }

  public get applicationRuntime(): Runtime | undefined {
    return this.runtime;
  }

  public async initialize(): Promise<void> {
    if (this._state !== "created") {
      return;
    }

    this._state = "initializing";

    try {
      await this.lifecycle?.initialize();

      this._state = "initialized";
    } catch (error) {
      this._state = "failed";

      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this._state === "running") {
      return;
    }

    if (this._state === "created") {
      await this.initialize();
    }

    if (this._state !== "initialized" && this._state !== "stopped") {
      throw new Error(
        `Application cannot start from state "${this._state}".`,
      );
    }

    this._state = "starting";

    try {
      await this.lifecycle?.start();

      this._state = "running";
    } catch (error) {
      this._state = "failed";

      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (
      this._state === "stopped" ||
      this._state === "created" ||
      this._state === "initialized"
    ) {
      return;
    }

    if (this._state !== "running" && this._state !== "failed") {
      throw new Error(
        `Application cannot stop from state "${this._state}".`,
      );
    }

    this._state = "stopping";

    try {
      await this.lifecycle?.stop();

      this._state = "stopped";
    } catch (error) {
      this._state = "failed";

      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (this._state === "stopped") {
      return;
    }

    await this.stop();
  }
}
