import type {
  Logger,
} from "../../logging/core/logger.js";

import type {
  ApplicationContext,
} from "../../application/applicationContext.context.js";

import type {
  ModuleLifecycleManager,
} from "../../modules/moduleLifecycle/index.js";

import type {
  ModuleRegistry,
} from "../../modules/moduleRegistry/index.js";

import type {
  RuntimeContext,
} from "../runtimeContext/index.js";

import type {
  RuntimeEnvironment,
} from "../runtimeEnvironment/index.js";

import type {
  ResolvedRuntimeOptions,
} from "../runtimeOptions/index.js";

/**
 * Dependencies required by RuntimeShutdown.
 */
export interface RuntimeShutdownDependencies {
  readonly context: RuntimeContext;
  readonly environment: RuntimeEnvironment;
  readonly application: ApplicationContext;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLifecycle: ModuleLifecycleManager;
  readonly logger: Logger;
}

/**
 * Options for a shutdown operation.
 */
export interface RuntimeShutdownConfig {
  readonly stopModules?: boolean;
  readonly destroyModules?: boolean;
  readonly continueOnStopError?: boolean;
  readonly continueOnDestroyError?: boolean;
  readonly timeoutMs?: number;
}

/**
 * Individual shutdown phase.
 */
export type RuntimeShutdownPhase =
  | "created"
  | "stopping"
  | "stopped"
  | "destroying"
  | "destroyed"
  | "completed"
  | "failed";

/**
 * Error captured during shutdown.
 */
export interface RuntimeShutdownErrorInfo {
  readonly phase: RuntimeShutdownPhase;
  readonly error: unknown;
  readonly moduleName?: string;
}

/**
 * Result of a shutdown operation.
 */
export interface RuntimeShutdownResult {
  readonly success: boolean;
  readonly phase: RuntimeShutdownPhase;
  readonly stoppedModules: number;
  readonly destroyedModules: number;
  readonly errors: readonly RuntimeShutdownErrorInfo[];
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly durationMs: number;
}

/**
 * Runtime shutdown contract.
 */
export interface RuntimeShutdown {
  readonly running: boolean;
  readonly phase: RuntimeShutdownPhase;
  shutdown(
    options?: RuntimeShutdownConfig,
  ): Promise<RuntimeShutdownResult>;
  getLastResult(): RuntimeShutdownResult | undefined;
  getShutdownContext(): import("../../context/core/context.js").Context | undefined;
  reset(): void;
}

/**
 * Internal resolved shutdown configuration.
 */
export interface ResolvedShutdownOptions {
  readonly stopModules: boolean;
  readonly destroyModules: boolean;
  readonly continueOnStopError: boolean;
  readonly continueOnDestroyError: boolean;
  readonly timeoutMs: number;
}
