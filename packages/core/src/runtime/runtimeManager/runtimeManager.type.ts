import type {
  ApplicationContext,
} from "../../application/applicationContext.context.js";

import type {
  ConfigurationManager,
} from "../../configuration/configurationManager.manager.js";

import type {
  Logger,
} from "../../logging/core/logger.js";

import type {
  ModuleLoader,
} from "../../modules/moduleLoader/index.js";

import type {
  ModuleLifecycleManager,
} from "../../modules/moduleLifecycle/index.js";

import type {
  ModuleRegistry,
} from "../../modules/moduleRegistry/index.js";

import type {
  RuntimeState,
} from "../runtimeState.state.js";

import type {
  RuntimeStateSnapshot,
} from "../runtimeState.state.js";

import type {
  RuntimeContext,
  RuntimeIdentity,
} from "../runtimeContext/index.js";

import type {
  RuntimeEnvironment,
} from "../runtimeEnvironment/index.js";

import type {
  RuntimeBootstrap,
} from "../runtimeBootstrap/runtimeBootstrap.type.js";

import type {
  RuntimeShutdown,
} from "../runtimeShutdown/runtimeShutdown.type.js";

import type {
  RuntimeOptions,
  ResolvedRuntimeOptions,
} from "../runtimeOptions/index.js";

/**
 * Dependencies required by the RuntimeManager.
 */
export interface RuntimeManagerDependencies {
  readonly application: ApplicationContext;
  readonly configuration: ConfigurationManager;
  readonly logger: Logger;
  readonly moduleRegistry: ModuleRegistry;
  readonly moduleLoader: ModuleLoader;
  readonly moduleLifecycle: ModuleLifecycleManager;
  readonly bootstrap?: RuntimeBootstrap;
  readonly shutdown?: RuntimeShutdown;
}

/**
 * Runtime manager lifecycle operations.
 */
export interface RuntimeManager {
  readonly context: RuntimeContext;
  readonly environment: RuntimeEnvironment;
  readonly identity: RuntimeIdentity;
  readonly options: ResolvedRuntimeOptions;
  readonly state: RuntimeState;
  readonly ready: boolean;
  readonly stopped: boolean;
  readonly failed: boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
  fail(error?: unknown): void;
  getStateSnapshot(): RuntimeStateSnapshot;
  getUptime(): number;
}

/**
 * Internal runtime manager state.
 */
export interface RuntimeManagerState {
  state: RuntimeState;
  startPromise?: Promise<void>;
  stopPromise?: Promise<void>;
  failureReason?: unknown;
}
