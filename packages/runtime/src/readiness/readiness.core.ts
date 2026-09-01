import type {
  Logger,
} from "@oyinlola141/lattice-logger";

import type {
  ReadinessState,
  ReadinessCheck,
  ReadinessTrackerState,
  ReadinessOptions,
} from "./readiness.type.js";

/**
 * Tracks runtime readiness state.
 */
export class ReadinessTracker {
  private state: ReadinessState = "not_ready";
  private readonly checks: Map<string, ReadinessCheck> = new Map();
  private readonly autoMarkReady: boolean;
  private ready = false;
  private reason?: string;

  public constructor(options: ReadinessOptions = {}) {
    this.autoMarkReady = options.autoMarkReady ?? true;

    if (options.initialChecks) {
      for (const check of options.initialChecks) {
        this.registerCheck(check.name, check.check);
      }
    }
  }

  /**
   * Registers a readiness check.
   */
  public registerCheck(
    name: string,
    check: () => boolean | Promise<boolean>,
  ): void {
    this.checks.set(name, {
      name,
      ready: false,
      lastCheckedAt: new Date(),
    });

    this.evaluateReadiness();
  }

  /**
   * Updates a readiness check result.
   */
  public async updateCheck(
    name: string,
    check: () => boolean | Promise<boolean>,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const result = await check();

      this.checks.set(name, {
        name,
        ready: result,
        lastCheckedAt: new Date(),
      });
    } catch {
      this.checks.set(name, {
        name,
        ready: false,
        lastCheckedAt: new Date(),
        message: "Check threw an error",
      });
    }

    this.evaluateReadiness();
  }

  /**
   * Marks the runtime as ready.
   */
  public markReady(reason?: string): void {
    this.state = "ready";
    this.ready = true;
    this.reason = reason;
  }

  /**
   * Marks the runtime as not ready.
   */
  public markNotReady(reason?: string): void {
    this.ready = false;
    this.reason = reason;

    if (this.state === "ready") {
      this.state = "degraded";
    }
  }

  /**
   * Updates the readiness state.
   */
  public setState(state: ReadinessState, reason?: string): void {
    this.state = state;

    if (state === "ready") {
      this.ready = true;
    } else if (state === "not_ready" || state === "shutting_down") {
      this.ready = false;
    }

    this.reason = reason;
  }

  /**
   * Returns whether the runtime is ready.
   */
  public isReady(): boolean {
    return this.ready;
  }

  /**
   * Returns the current readiness state.
   */
  public getState(): ReadinessTrackerState {
    return Object.freeze({
      state: this.state,
      checks: Object.freeze(new Map(this.checks)),
      ready: this.ready,
      reason: this.reason,
    });
  }

  /**
   * Evaluates overall readiness based on registered checks.
   */
  private evaluateReadiness(): void {
    if (this.autoMarkReady && this.checks.size > 0) {
      const allReady = [...this.checks.values()].every(check => check.ready);

      if (allReady && !this.ready) {
        this.markReady("All readiness checks passed.");
      } else if (!allReady && this.ready) {
        this.markNotReady("One or more readiness checks failed.");
      }
    }
  }
}
