import type { ApplicationContext } from "../../application/applicationContext.context.js";

import type { ConfigurationManager } from "../../configuration/configurationManager.manager.js";

import type { Logger } from "../../logging/core/logger.js";

import type { ModuleLoader } from "../../modules/moduleLoader/index.js";

import type { ModuleLifecycleManager } from "../../modules/moduleLifecycle/index.js";

import type { ModuleRegistry } from "../../modules/moduleRegistry/index.js";

/**
 * Runtime execution mode.
 */
export type RuntimeMode = "development" | "test" | "production";

/**
 * Runtime role.
 */
export type RuntimeRole =
  "application" | "api" | "worker" | "scheduler" | "cli";

/**
 * Options controlling runtime startup behavior.
 */
export interface RuntimeStartupOptions {
  readonly autoLoadModules?: boolean;
  readonly autoInitializeModules?: boolean;
  readonly autoStartModules?: boolean;
  readonly continueOnInitializeError?: boolean;
  readonly continueOnStartError?: boolean;
  readonly timeoutMs?: number;
}

/**
 * Options controlling runtime shutdown.
 */
export interface RuntimeShutdownOptions {
  readonly autoStopModules?: boolean;
  readonly autoDestroyModules?: boolean;
  readonly continueOnStopError?: boolean;
  readonly continueOnDestroyError?: boolean;
  readonly timeoutMs?: number;
}

/**
 * Options related to runtime process signals.
 */
export interface RuntimeSignalOptions {
  readonly handleSigint?: boolean;
  readonly handleSigterm?: boolean;
  readonly handleSighup?: boolean;
  readonly handleUncaughtException?: boolean;
  readonly handleUnhandledRejection?: boolean;
}

/**
 * Options controlling runtime diagnostics.
 */
export interface RuntimeDiagnosticsOptions {
  readonly startupLogging?: boolean;
  readonly shutdownLogging?: boolean;
  readonly includeState?: boolean;
  readonly includeModules?: boolean;
}

/**
 * Dependencies that can be supplied to the runtime.
 */
export interface RuntimeInfrastructure {
  readonly application: ApplicationContext;
  readonly configuration: ConfigurationManager;
  readonly logger: Logger;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLoader: ModuleLoader;
  readonly moduleLifecycle: ModuleLifecycleManager;
}

/**
 * Complete runtime options.
 */
export interface RuntimeOptions {
  readonly name?: string;
  readonly mode?: RuntimeMode;
  readonly role?: RuntimeRole;
  readonly startup?: RuntimeStartupOptions;
  readonly shutdown?: RuntimeShutdownOptions;
  readonly signals?: RuntimeSignalOptions;
  readonly diagnostics?: RuntimeDiagnosticsOptions;
  readonly infrastructure?: Partial<RuntimeInfrastructure>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Fully normalized runtime options.
 */
export interface ResolvedRuntimeOptions {
  readonly name: string;
  readonly mode: RuntimeMode;
  readonly role: RuntimeRole;
  readonly startup: Required<RuntimeStartupOptions>;
  readonly shutdown: Required<RuntimeShutdownOptions>;
  readonly signals: Required<RuntimeSignalOptions>;
  readonly diagnostics: Required<RuntimeDiagnosticsOptions>;
  readonly infrastructure: Partial<RuntimeInfrastructure>;
  readonly metadata: Readonly<Record<string, unknown>>;
}
