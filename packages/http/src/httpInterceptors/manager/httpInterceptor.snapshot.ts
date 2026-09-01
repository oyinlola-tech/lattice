/**
 * Interceptor snapshot functionality.
 *
 * @module httpInterceptors/manager/snapshot
 */

import type { HttpInterceptorSnapshot } from "../httpInterceptor.type.js";

import type { InterceptorRegistry } from "./httpInterceptor.registration.js";
import { getAll } from "./httpInterceptor.lookup.js";

/**
 * Creates a snapshot of the interceptor registry.
 */
export function createSnapshot<T>(
  registry: InterceptorRegistry<T>,
): HttpInterceptorSnapshot {
  return {
    interceptors: getAll(registry.underlying).map((i) => i.metadata),
    timestamp: Date.now(),
    version: registry.version_number,
  };
}
