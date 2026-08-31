import type {
  RuntimeEventPayload,
  RuntimeModuleEventPayload,
  RuntimeFailureEventPayload,
  RuntimeHealthEventPayload,
  RuntimeReadinessEventPayload,
  RuntimeEventType,
} from "./runtimeEvents.type.js";

/**
 * Creates a base runtime event payload.
 */
export function createRuntimeEventPayload(
  runtimeId: string,
  state: string,
): RuntimeEventPayload {
  return Object.freeze({
    runtimeId,
    state,
    timestamp: new Date(),
  });
}

/**
 * Creates a module-specific runtime event payload.
 */
export function createModuleEventPayload(
  runtimeId: string,
  state: string,
  moduleId: string,
  moduleName: string,
  options: {
    readonly durationMs?: number;
    readonly error?: Error;
  } = {},
): RuntimeModuleEventPayload {
  return Object.freeze({
    runtimeId,
    state,
    timestamp: new Date(),
    moduleId,
    moduleName,
    ...(options.durationMs !== undefined && { durationMs: options.durationMs }),
    ...(options.error !== undefined && { error: options.error }),
  });
}

/**
 * Creates a runtime failure event payload.
 */
export function createFailureEventPayload(
  runtimeId: string,
  state: string,
  error: Error,
  phase: string,
  failedModuleId?: string,
): RuntimeFailureEventPayload {
  return Object.freeze({
    runtimeId,
    state,
    timestamp: new Date(),
    error,
    phase,
    ...(failedModuleId !== undefined && { failedModuleId }),
  });
}

/**
 * Creates a runtime health change event payload.
 */
export function createHealthEventPayload(
  runtimeId: string,
  state: string,
  previousState: string,
  currentState: string,
  checks?: ReadonlyArray<{
    readonly name: string;
    readonly healthy: boolean;
  }>,
): RuntimeHealthEventPayload {
  return Object.freeze({
    runtimeId,
    state,
    timestamp: new Date(),
    previousState,
    currentState,
    ...(checks !== undefined && { checks }),
  });
}

/**
 * Creates a runtime readiness change event payload.
 */
export function createReadinessEventPayload(
  runtimeId: string,
  state: string,
  ready: boolean,
  reason?: string,
): RuntimeReadinessEventPayload {
  return Object.freeze({
    runtimeId,
    state,
    timestamp: new Date(),
    ready,
    ...(reason !== undefined && { reason }),
  });
}
