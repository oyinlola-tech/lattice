import type { ApplicationContext } from "../../application/applicationContext.context.js";

import type { ConfigurationManager } from "../../configuration/configurationManager.manager.js";

import type { Logger } from "../../logging/core/logger.js";

import type { ModuleLoader } from "../../modules/moduleLoader/index.js";

import type { ModuleLifecycleManager } from "../../modules/moduleLifecycle/index.js";

import type { ModuleRegistry } from "../../modules/moduleRegistry/index.js";

import type { RuntimeState } from "../runtimeState.state.js";

import type { RuntimeStateSnapshot } from "../runtimeState.state.js";

import type { RuntimeMode, RuntimeRole } from "../runtimeOptions/index.js";

/**
 * Runtime identity.
 */
export interface RuntimeIdentity {
  readonly id: string;
  readonly name: string;
  readonly mode: RuntimeMode;
  readonly role: RuntimeRole;
  readonly createdAt: Date;
  readonly processId?: number;
}

/**
 * Runtime timing information.
 */
export interface RuntimeTiming {
  readonly createdAt: Date;
  readonly startupStartedAt?: Date;
  readonly readyAt?: Date;
  readonly shutdownStartedAt?: Date;
  readonly stoppedAt?: Date;
}

/**
 * Runtime context dependencies.
 */
export interface RuntimeContextDependencies {
  readonly application: ApplicationContext;
  readonly configuration: ConfigurationManager;
  readonly logger: Logger;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLoader: ModuleLoader;
  readonly moduleLifecycle: ModuleLifecycleManager;
}

/**
 * Runtime context contract.
 */
export interface RuntimeContext {
  readonly identity: RuntimeIdentity;
  readonly state: RuntimeState;
  readonly timing: RuntimeTiming;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly application: ApplicationContext;
  readonly configuration: ConfigurationManager;
  readonly logger: Logger;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLoader: ModuleLoader;
  readonly moduleLifecycle: ModuleLifecycleManager;
  getStateSnapshot(): RuntimeStateSnapshot;
  get<T = unknown>(key: string): T | undefined;
  has(key: string): boolean;
  getUptime(): number;
}

/**
 * Internal mutable state used by RuntimeContext.
 */
export interface RuntimeContextState {
  state: RuntimeState;
  timing: RuntimeTiming;
}
