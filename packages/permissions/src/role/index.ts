/**
 * Role definitions, registry, and inheritance hierarchy.
 *
 * @module role
 */

export {
  createRoleRegistry,
  type RoleRegistryOptions,
} from "./roleRegistry.js";

export { resolveRolePermissions } from "./roleHierarchy.js";
