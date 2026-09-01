/**
 * Role hierarchy resolver — resolves inherited permissions from role chains.
 *
 * @module role/roleHierarchy
 */

import type { RoleDefinition } from "../permissionTypes/index.js";
import {
  CircularRoleInheritanceError,
  RoleNotFoundError,
} from "../permissionErrors/index.js";

/**
 * Resolve all permissions for a set of role names, following inheritance chains.
 *
 * @param roleNames - Direct role names assigned to the actor.
 * @param getRole - Function to look up a role definition by name.
 * @returns Deduplicated list of all permission strings.
 */
export function resolveRolePermissions(
  roleNames: readonly string[],
  getRole: (name: string) => RoleDefinition | undefined,
): readonly string[] {
  const permissions = new Set<string>();
  const visited = new Set<string>();

  for (const name of roleNames) {
    collectPermissions(name, getRole, permissions, visited, []);
  }

  return Array.from(permissions);
}

/**
 * Collect permissions from a role and its ancestors, detecting cycles.
 */
function collectPermissions(
  roleName: string,
  getRole: (name: string) => RoleDefinition | undefined,
  permissions: Set<string>,
  visited: Set<string>,
  chain: string[],
): void {
  const role = getRole(roleName);
  if (!role) {
    throw new RoleNotFoundError(roleName);
  }

  // Cycle detection — check before adding to visited
  if (chain.includes(roleName)) {
    throw new CircularRoleInheritanceError([...chain, roleName]);
  }

  // Skip if already fully processed (not in current chain)
  if (visited.has(roleName)) return;

  visited.add(roleName);
  const newChain = [...chain, roleName];

  for (const perm of role.permissions) {
    permissions.add(perm);
  }

  if (role.inherits) {
    for (const parent of role.inherits) {
      collectPermissions(parent, getRole, permissions, visited, newChain);
    }
  }
}
