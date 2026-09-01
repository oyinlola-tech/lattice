/**
 * Route registry factory functions.
 *
 * @module httpRoute/registry/factory
 */

import type { RouteRegistryOptions } from "./core/httpRegistry.type.js";

import { RouteRegistry } from "./httpRegistry.core.js";
import { RouteRegistryGroup } from "./httpRegistry.group.js";

/**
 * Creates a new route registry.
 */
export function createRouteRegistry(
  options: RouteRegistryOptions = {},
): RouteRegistry {
  return new RouteRegistry(options);
}

/**
 * Creates a new route registry group.
 */
export function createRouteRegistryGroup(
  options: RouteRegistryOptions = {},
): RouteRegistryGroup {
  return new RouteRegistryGroup(options);
}

/**
 * Type guard for RouteRegistry.
 */
export function isRouteRegistry(value: unknown): value is RouteRegistry {
  return value instanceof RouteRegistry;
}

/**
 * Type guard for RouteRegistryGroup.
 */
export function isRouteRegistryGroup(
  value: unknown,
): value is RouteRegistryGroup {
  return value instanceof RouteRegistryGroup;
}
