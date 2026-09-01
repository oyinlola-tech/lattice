/**
 * Central registry for role definitions.
 *
 * @module role/roleRegistry
 */

import type { RoleDefinition } from "../permissionTypes/index.js";
import {
  DuplicateRoleError,
  InvalidRoleError,
} from "../permissionErrors/index.js";

/** Options for the role registry. */
export interface RoleRegistryOptions {
  /** Allow overwriting existing roles. Defaults to false. */
  readonly allowOverride?: boolean;
}

/**
 * Create a role registry.
 */
export function createRoleRegistry(options?: RoleRegistryOptions) {
  const roles = new Map<string, RoleDefinition>();
  const allowOverride = options?.allowOverride ?? false;

  return {
    /**
     * Register a role definition.
     */
    define(definition: RoleDefinition): void {
      if (!definition.name || definition.name.trim() === "") {
        throw new InvalidRoleError("Role name cannot be empty");
      }
      if (!definition.permissions || definition.permissions.length === 0) {
        throw new InvalidRoleError(
          `Role "${definition.name}" must have at least one permission`,
        );
      }

      if (roles.has(definition.name) && !allowOverride) {
        throw new DuplicateRoleError(definition.name);
      }

      roles.set(definition.name, Object.freeze({ ...definition }));
    },

    /**
     * Get a role by name.
     */
    get(name: string): RoleDefinition | undefined {
      return roles.get(name);
    },

    /**
     * Check if a role exists.
     */
    has(name: string): boolean {
      return roles.has(name);
    },

    /**
     * Get all registered role names.
     */
    names(): readonly string[] {
      return Array.from(roles.keys());
    },

    /**
     * Get all registered role definitions.
     */
    all(): readonly RoleDefinition[] {
      return Array.from(roles.values());
    },

    /**
     * Remove a role from the registry.
     */
    remove(name: string): boolean {
      return roles.delete(name);
    },

    /**
     * Clear all registered roles.
     */
    clear(): void {
      roles.clear();
    },
  };
}
