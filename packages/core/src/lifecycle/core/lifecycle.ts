import type { Disposable } from "../../contracts/disposable.js";
import type { Logger } from "../../logging/core/logger.js";

/** Lifecycle states supported by the Lattice application runtime. */
export const LifecycleState = {
  CREATED: "created",
  INITIALIZING: "initializing",
  INITIALIZED: "initialized",
  STARTING: "starting",
  RUNNING: "running",
  STOPPING: "stopping",
  STOPPED: "stopped",
  FAILED: "failed",
} as const;

export type LifecycleState =
  (typeof LifecycleState)[keyof typeof LifecycleState];

/** A lifecycle participant can participate in application initialization and shutdown. */
export interface LifecycleParticipant {
  readonly name: string;
  initialize?(): Promise<void> | void;
  start?(): Promise<void> | void;
  stop?(): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

/** Options used by the lifecycle manager. */
export interface LifecycleOptions {
  readonly logger?: Logger;
  readonly continueOnShutdownError?: boolean;
}

/** Coordinates initialization, startup, shutdown, and disposal of application resources. */
export class Lifecycle {
  private state: LifecycleState = LifecycleState.CREATED;
  private readonly participants: LifecycleParticipant[] = [];
  private readonly logger?: Logger;
  private readonly continueOnShutdownError: boolean;

  public constructor(options: LifecycleOptions = {}) {
    this.logger = options.logger;
    this.continueOnShutdownError = options.continueOnShutdownError ?? true;
  }

  public getState(): LifecycleState {
    return this.state;
  }
  public getParticipants(): readonly LifecycleParticipant[] {
    return [...this.participants];
  }

  public register(participant: LifecycleParticipant): void {
    if (
      this.state !== LifecycleState.CREATED &&
      this.state !== LifecycleState.INITIALIZING &&
      this.state !== LifecycleState.INITIALIZED
    ) {
      throw new Error(
        `Cannot register lifecycle participant "${participant.name}" while application is "${this.state}".`,
      );
    }
    this.participants.push(participant);
    this.logger?.debug("Lifecycle participant registered", {
      participant: participant.name,
    });
  }

  public async initialize(): Promise<void> {
    if (this.state === LifecycleState.INITIALIZED) return;
    if (this.state === LifecycleState.INITIALIZING)
      return this.waitForInitialization();
    if (this.state !== LifecycleState.CREATED)
      throw new Error(
        `Cannot initialize application while state is "${this.state}".`,
      );

    this.state = LifecycleState.INITIALIZING;
    this.logger?.debug("Application initialization started");
    try {
      for (const participant of this.participants) {
        this.logger?.debug("Initializing lifecycle participant", {
          participant: participant.name,
        });
        await participant.initialize?.();
      }
      this.state = LifecycleState.INITIALIZED;
      this.logger?.info("Application initialization completed");
    } catch (error) {
      this.state = LifecycleState.FAILED;
      this.logger?.error("Application initialization failed", error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (
      this.state === LifecycleState.RUNNING ||
      this.state === LifecycleState.STARTING
    )
      return;
    if (this.state === LifecycleState.CREATED) await this.initialize();
    if (this.state === LifecycleState.INITIALIZING)
      await this.waitForInitialization();
    if (this.state !== LifecycleState.INITIALIZED)
      throw new Error(
        `Cannot start application while state is "${this.state}".`,
      );

    this.state = LifecycleState.STARTING;
    this.logger?.debug("Application startup started");
    try {
      for (const participant of this.participants) {
        this.logger?.debug("Starting lifecycle participant", {
          participant: participant.name,
        });
        await participant.start?.();
      }
      this.state = LifecycleState.RUNNING;
      this.logger?.info("Application startup completed");
    } catch (error) {
      this.state = LifecycleState.FAILED;
      this.logger?.error("Application startup failed", error);
      throw error;
    }
  }

  private async waitForInitialization(): Promise<void> {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (
        this.state === LifecycleState.INITIALIZED ||
        this.state === LifecycleState.FAILED
      )
        return;
      if (this.state !== LifecycleState.INITIALIZING) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(
      `Timed out waiting for initialization to complete. Current state: "${this.state}".`,
    );
  }

  public async stop(): Promise<void> {
    if (this.state === LifecycleState.STOPPED) return;
    if (
      this.state !== LifecycleState.RUNNING &&
      this.state !== LifecycleState.FAILED
    )
      throw new Error(
        `Cannot stop application while state is "${this.state}".`,
      );

    this.state = LifecycleState.STOPPING;
    this.logger?.debug("Application shutdown started");
    const errors: unknown[] = [];

    for (let i = this.participants.length - 1; i >= 0; i--) {
      const participant = this.participants[i]!;
      try {
        this.logger?.debug("Stopping lifecycle participant", {
          participant: participant.name,
        });
        await participant.stop?.();
      } catch (error) {
        errors.push(error);
        this.logger?.error("Failed to stop lifecycle participant", error, {
          participant: participant.name,
        });
        if (!this.continueOnShutdownError) break;
      }
    }

    this.state = LifecycleState.STOPPED;
    this.logger?.info("Application shutdown completed");
    if (errors.length > 0)
      throw new AggregateError(
        errors,
        "One or more lifecycle participants failed to stop.",
      );
  }

  public async dispose(): Promise<void> {
    const errors: unknown[] = [];
    for (let i = this.participants.length - 1; i >= 0; i--) {
      const participant = this.participants[i]!;
      try {
        this.logger?.debug("Disposing lifecycle participant", {
          participant: participant.name,
        });
        await participant.dispose?.();
      } catch (error) {
        errors.push(error);
        this.logger?.error("Failed to dispose lifecycle participant", error, {
          participant: participant.name,
        });
        if (!this.continueOnShutdownError) break;
      }
    }
    if (errors.length > 0)
      throw new AggregateError(
        errors,
        "One or more lifecycle participants failed to dispose.",
      );
  }

  public async shutdown(): Promise<void> {
    let stopError: unknown;
    try {
      await this.stop();
    } catch (error) {
      stopError = error;
    }
    let disposeError: unknown;
    try {
      await this.dispose();
    } catch (error) {
      disposeError = error;
    }
    if (stopError && disposeError)
      throw new AggregateError(
        [stopError, disposeError],
        "Application shutdown completed with errors.",
      );
    if (stopError) throw stopError;
    if (disposeError) throw disposeError;
  }
}
