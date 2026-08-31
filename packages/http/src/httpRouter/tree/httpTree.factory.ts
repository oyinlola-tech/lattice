/**
 * Route tree factory.
 *
 * @module httpRoute/tree/factory
 */

import type {
  RouteTreeOptions,
} from "./core/httpTree.type.js";

import { RouteTree } from "./httpTree.core.js";

/**
 * Creates a new route tree.
 */
export function createRouteTree(
  options: RouteTreeOptions = {},
): RouteTree {
  return new RouteTree(options);
}
