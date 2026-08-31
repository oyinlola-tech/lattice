/**
 * Readiness state of the runtime.
 */
export type ReadinessState =
  | "not_ready"
  | "initializing"
  | "ready"
  | "degraded"
  | "shutting_down";

/**
 * Readiness check result.
 */
export interface ReadinessCheck {
  readonly name: string;
  readonly ready: boolean;
  readonly message?: string;
  readonly lastCheckedAt: Date;
}

/**
 * Readiness tracker state.
 */
export interface ReadinessTrackerState {
  readonly state: ReadinessState;
  readonly checks: ReadonlyMap<string, ReadinessCheck>;
  readonly ready: boolean;
  readonly reason?: string;
}

/**
 * Options for readiness tracking.
 */
export interface ReadinessOptions {
  /**
   * Initial readiness checks to register.
   */
  readonly initialChecks?: ReadonlyArray<{
    readonly name: string;
    readonly check: () => boolean | Promise<boolean>;
  }>;

  /**
   * Whether to automatically mark as ready when all checks pass.
   * @default true
   */
  readonly autoMarkReady?: boolean;
}
