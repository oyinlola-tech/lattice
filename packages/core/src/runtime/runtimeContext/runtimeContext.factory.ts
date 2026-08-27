import type {
  RuntimeMode,
  RuntimeRole,
} from "../runtimeOptions/index.js";

import type {
  RuntimeIdentity,
  RuntimeContextDependencies,
} from "./runtimeContext.type.js";

import {
  DefaultRuntimeContext,
} from "./runtimeContext.core.js";

/**
 * Creates a unique runtime identifier.
 */
export function createRuntimeId(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);

  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return [
    normalizedName || "runtime",
    timestamp,
    random,
  ].join("-");
}

/**
 * Creates a RuntimeIdentity.
 */
export function createRuntimeIdentity(
  options: {
    readonly name: string;
    readonly mode: RuntimeMode;
    readonly role: RuntimeRole;
    readonly id?: string;
    readonly processId?: number;
  },
): RuntimeIdentity {
  const createdAt = new Date();

  return Object.freeze({
    id: options.id ?? createRuntimeId(options.name),
    name: options.name,
    mode: options.mode,
    role: options.role,
    createdAt,
    processId: options.processId ?? getProcessId(),
  });
}

/**
 * Creates a RuntimeContext.
 */
export function createRuntimeContext(
  identity: RuntimeIdentity,
  dependencies: RuntimeContextDependencies,
  metadata: Readonly<Record<string, unknown>> = {},
): DefaultRuntimeContext {
  return new DefaultRuntimeContext(
    identity,
    dependencies,
    metadata,
  );
}

/**
 * Attempts to retrieve the current process ID.
 */
function getProcessId(): number | undefined {
  const runtimeProcess = (
    globalThis as {
      process?: { pid?: number };
    }
  ).process;

  return runtimeProcess?.pid;
}
