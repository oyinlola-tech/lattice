/**
 * Central registry for defining and looking up permissions.
 *
 * @module permission/permissionRegistry
 */

import type { Permission } from "../permissionTypes/index.js";
import {
  DuplicatePermissionError,
  PermissionNotFoundError,
} from "../permissionErrors/index.js";
import { parsePermission, matchesPermission } from "./permission.core.js";

/** A registered permission with optional metadata. */
interface RegisteredPermission {
  readonly parsed: Permission;
  readonly description?: string;
  readonly implies?: readonly string[];
}

/** Options for the permission registry. */
export interface PermissionRegistryOptions {
  /** Allow overwriting existing permissions. Defaults to false. */
  readonly allowOverride?: boolean;
}

/**
 * Create a permission registry.
 */
export function createPermissionRegistry(options?: PermissionRegistryOptions) {
  const permissions = new Map<string, RegisteredPermission>();
  const allowOverride = options?.allowOverride ?? false;

  return {
    /**
     * Register a permission by string or structured object.
     */
    define(
      permission: string | Permission,
      opts?: {
        readonly description?: string;
        readonly implies?: readonly string[];
      },
    ): void {
      const parsed =
        typeof permission === "string"
          ? parsePermission(permission)
          : permission;
      const key = `${parsed.resource}:${parsed.action}`;

      if (permissions.has(key) && !allowOverride) {
        throw new DuplicatePermissionError(key);
      }

      permissions.set(key, {
        parsed: Object.freeze(parsed),
        description: opts?.description,
        implies: opts?.implies,
      });
    },

    /**
     * Look up a registered permission by string.
     */
    get(permission: string): Permission | undefined {
      return permissions.get(permission)?.parsed;
    },

    /**
     * Get the full registered permission entry.
     */
    getEntry(permission: string): RegisteredPermission | undefined {
      return permissions.get(permission);
    },

    /**
     * Check if a permission is registered.
     */
    has(permission: string): boolean {
      return permissions.has(permission);
    },

    /**
     * Get all registered permission strings.
     */
    all(): readonly string[] {
      return Array.from(permissions.keys());
    },

    /**
     * Get permissions that match a pattern.
     */
    match(pattern: string): readonly Permission[] {
      const results: Permission[] = [];
      for (const [, entry] of permissions) {
        if (matchesPermission(pattern, entry.parsed)) {
          results.push(entry.parsed);
        }
      }
      return results;
    },

    /**
     * Get permissions implied by a given permission.
     */
    getImplied(permission: string): readonly string[] {
      return permissions.get(permission)?.implies ?? [];
    },

    /**
     * Remove a permission from the registry.
     */
    remove(permission: string): boolean {
      return permissions.delete(permission);
    },

    /**
     * Clear all registered permissions.
     */
    clear(): void {
      permissions.clear();
    },
  };
}
