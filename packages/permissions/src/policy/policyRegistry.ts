/**
 * Policy registry — manages named authorization policies.
 *
 * @module policy/policyRegistry
 */

import type { PermissionPolicyDefinition } from "../permissionTypes/index.js";

/**
 * Create a policy registry.
 */
export function createPolicyRegistry() {
  const policies = new Map<string, PermissionPolicyDefinition>();

  return {
    /**
     * Register a policy.
     */
    define(definition: PermissionPolicyDefinition): void {
      policies.set(definition.name, Object.freeze({ ...definition }));
    },

    /**
     * Get a policy by name.
     */
    get(name: string): PermissionPolicyDefinition | undefined {
      return policies.get(name);
    },

    /**
     * Get all policies that apply to a given permission string.
     */
    forPermission(permission: string): readonly PermissionPolicyDefinition[] {
      const results: PermissionPolicyDefinition[] = [];
      for (const [, policy] of policies) {
        if (policy.permissions.includes(permission)) {
          results.push(policy);
        }
      }
      // Sort by priority descending
      return results.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    },

    /**
     * Get all registered policy names.
     */
    names(): readonly string[] {
      return Array.from(policies.keys());
    },

    /**
     * Remove a policy.
     */
    remove(name: string): boolean {
      return policies.delete(name);
    },

    /**
     * Clear all policies.
     */
    clear(): void {
      policies.clear();
    },
  };
}
