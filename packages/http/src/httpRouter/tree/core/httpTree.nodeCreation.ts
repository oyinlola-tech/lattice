/**
 * Route tree node creation utilities.
 *
 * @module httpRoute/tree/nodeCreation
 */

import type {
  MutableRouteTreeNode,
} from "./httpTree.type.js";

/**
 * Creates a child node based on the segment.
 */
export function createChildNode(segment: string): MutableRouteTreeNode {
  if (segment.startsWith(":")) {
    return {
      name: segment.slice(1),
      type: "parameter",
      children: new Map(),
      methods: new Set(),
      metadata: {},
      optional: false,
      wildcard: false,
      param: segment.slice(1),
    };
  }

  if (segment === "*") {
    return {
      name: "*",
      type: "wildcard",
      children: new Map(),
      methods: new Set(),
      metadata: {},
      optional: false,
      wildcard: true,
    };
  }

  if (segment.endsWith("?")) {
    return {
      name: segment.slice(0, -1),
      type: "optional",
      children: new Map(),
      methods: new Set(),
      metadata: {},
      optional: true,
      wildcard: false,
    };
  }

  return {
    name: segment,
    type: "static",
    children: new Map(),
    methods: new Set(),
    metadata: {},
    optional: false,
    wildcard: false,
  };
}
