/**
 * Runtime lifecycle events.
 *
 * These events are emitted through the EventBus when
 * the runtime transitions through its lifecycle.
 */
export type RuntimeEventType =
  | "runtime.created"
  | "runtime.initializing"
  | "runtime.initialized"
  | "runtime.starting"
  | "runtime.running"
  | "runtime.stopping"
  | "runtime.stopped"
  | "runtime.failed"
  | "runtime.module.initializing"
  | "runtime.module.initialized"
  | "runtime.module.starting"
  | "runtime.module.started"
  | "runtime.module.stopping"
  | "runtime.module.stopped"
  | "runtime.module.failed"
  | "runtime.shutdown.drain"
  | "runtime.shutdown.complete"
  | "runtime.health.changed"
  | "runtime.readiness.changed";

/**
 * Base payload for all runtime events.
 */
export interface RuntimeEventPayload {
  readonly runtimeId: string;
  readonly timestamp: Date;
  readonly state: string;
}

/**
 * Payload for module-specific runtime events.
 */
export interface RuntimeModuleEventPayload extends RuntimeEventPayload {
  readonly moduleId: string;
  readonly moduleName: string;
  readonly durationMs?: number;
  readonly error?: Error;
}

/**
 * Payload for runtime failure events.
 */
export interface RuntimeFailureEventPayload extends RuntimeEventPayload {
  readonly error: Error;
  readonly phase: string;
  readonly failedModuleId?: string;
}

/**
 * Payload for runtime health change events.
 */
export interface RuntimeHealthEventPayload extends RuntimeEventPayload {
  readonly previousState: string;
  readonly currentState: string;
  readonly checks?: ReadonlyArray<{
    readonly name: string;
    readonly healthy: boolean;
  }>;
}

/**
 * Payload for runtime readiness change events.
 */
export interface RuntimeReadinessEventPayload extends RuntimeEventPayload {
  readonly ready: boolean;
  readonly reason?: string;
}

/**
 * Maps event types to their payload types.
 */
export interface RuntimeEventMap {
  "runtime.created": RuntimeEventPayload;
  "runtime.initializing": RuntimeEventPayload;
  "runtime.initialized": RuntimeEventPayload;
  "runtime.starting": RuntimeEventPayload;
  "runtime.running": RuntimeEventPayload;
  "runtime.stopping": RuntimeEventPayload;
  "runtime.stopped": RuntimeEventPayload;
  "runtime.failed": RuntimeFailureEventPayload;
  "runtime.module.initializing": RuntimeModuleEventPayload;
  "runtime.module.initialized": RuntimeModuleEventPayload;
  "runtime.module.starting": RuntimeModuleEventPayload;
  "runtime.module.started": RuntimeModuleEventPayload;
  "runtime.module.stopping": RuntimeModuleEventPayload;
  "runtime.module.stopped": RuntimeModuleEventPayload;
  "runtime.module.failed": RuntimeModuleEventPayload;
  "runtime.shutdown.drain": RuntimeEventPayload;
  "runtime.shutdown.complete": RuntimeEventPayload;
  "runtime.health.changed": RuntimeHealthEventPayload;
  "runtime.readiness.changed": RuntimeReadinessEventPayload;
}
