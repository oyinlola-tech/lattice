/**
 * Permission parsing, matching, and registry.
 *
 * @module permission
 */

export {
  parsePermission,
  isValidPermission,
  matches,
  matchesPermission,
} from "./permission.core.js";

export {
  createPermissionRegistry,
  type PermissionRegistryOptions,
} from "./permissionRegistry.js";
