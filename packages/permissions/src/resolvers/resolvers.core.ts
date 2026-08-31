/**
 * Resolver implementations for permissions, roles, and actors.
 *
 * @module resolvers/resolvers
 */

import type {
  PermissionActor,
  PermissionRule,
  PermissionResolver,
  RoleResolver,
} from "../permissionTypes/index.js";

/**
 * In-memory permission resolver — returns permissions from a map.
 */
export function createMemoryPermissionResolver(
  store: Map<string, readonly PermissionRule[]>,
): PermissionResolver {
  return {
    async resolvePermissions(actor: PermissionActor): Promise<readonly PermissionRule[]> {
      return store.get(actor.id) ?? [];
    },
  };
}

/**
 * In-memory role resolver — returns roles from a map.
 */
export function createMemoryRoleResolver(
  store: Map<string, readonly string[]>,
): RoleResolver {
  return {
    async resolveRoles(actor: PermissionActor): Promise<readonly string[]> {
      return store.get(actor.id) ?? [];
    },
  };
}

/**
 * Static permission resolver — always returns the same rules.
 */
export function createStaticPermissionResolver(
  rules: readonly PermissionRule[],
): PermissionResolver {
  return {
    async resolvePermissions(): Promise<readonly PermissionRule[]> {
      return rules;
    },
  };
}

/**
 * Static role resolver — always returns the same roles.
 */
export function createStaticRoleResolver(
  roles: readonly string[],
): RoleResolver {
  return {
    async resolveRoles(): Promise<readonly string[]> {
      return roles;
    },
  };
}
