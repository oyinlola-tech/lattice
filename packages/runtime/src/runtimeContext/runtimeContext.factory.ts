import {
  randomUUID,
} from "node:crypto";

import type {
  RuntimeId,
} from "../runtimeState/runtimeState.type.js";

/**
 * Generates a unique runtime identifier.
 */
export function createRuntimeId(): RuntimeId {
  return `rt_${randomUUID().replace(/-/g, "")}` as RuntimeId;
}

/**
 * Generates a correlation ID for request tracking.
 */
export function createCorrelationId(): string {
  return `corr_${randomUUID().replace(/-/g, "")}`;
}

/**
 * Generates a request ID.
 */
export function createRequestId(): string {
  return `req_${randomUUID().replace(/-/g, "")}`;
}
