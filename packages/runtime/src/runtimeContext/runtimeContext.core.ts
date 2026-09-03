import type { Environment } from "@zudoliblib/constants";

import { createRuntimeId as generateRuntimeId } from "./runtimeContext.factory.js";

import type {
  RuntimeContext,
  RuntimeContextDependencies,
  RuntimeIdentity,
} from "./runtimeContext.type.js";

import type { RuntimeStatus } from "../runtimeState/runtimeState.type.js";

import { createStatus } from "../runtimeState/runtimeState.core.js";

/**
 * Creates a runtime context.
 */
export function createRuntimeContext(
  dependencies: RuntimeContextDependencies,
): RuntimeContext {
  const status = createStatus("created");

  return Object.freeze({
    runtimeId: dependencies.runtimeId,
    environment: dependencies.environment,
    applicationName: dependencies.applicationName,
    applicationVersion: dependencies.applicationVersion,
    state: "created",
    status,
    logger: dependencies.logger,
    container: dependencies.container,
    eventBus: dependencies.eventBus,
    health: {
      state: "unknown" as const,
      checks: [],
      timestamp: new Date(),
    },
    ready: false,
  });
}

/**
 * Creates runtime identity information.
 */
export function createRuntimeIdentity(
  runtimeId: string,
  environment: Environment,
  applicationName: string,
  applicationVersion: string,
): RuntimeIdentity {
  return Object.freeze({
    runtimeId,
    environment,
    applicationName,
    applicationVersion,
    hostname:
      typeof process !== "undefined"
        ? (process.env.HOSTNAME ?? "unknown")
        : "unknown",
    processId: typeof process !== "undefined" ? process.pid : 0,
  });
}
