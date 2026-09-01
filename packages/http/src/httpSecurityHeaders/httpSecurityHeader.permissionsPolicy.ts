/**
 * Permissions policy utilities.
 *
 * @module httpSecurityHeaders/permissionsPolicy
 */

import type {
  PermissionsPolicy,
  PermissionsPolicyValue,
} from "./core/httpSecurityHeader.type.js";

/**
 * Formats a PermissionsPolicy object into a header string.
 */
export function formatPermissionsPolicy(policy: PermissionsPolicy): string {
  return Object.entries(policy)
    .map(([feature, value]) => {
      if (typeof value === "boolean") {
        return `${feature}=${value ? "*" : "()"}`;
      }
      if (Array.isArray(value)) {
        return `${feature}=(${value.join(" ")})`;
      }
      return `${feature}=${value}`;
    })
    .join(", ");
}

/**
 * Parses a Permissions-Policy header string.
 */
export function parsePermissionsPolicy(
  header: string | undefined,
): PermissionsPolicy {
  if (!header) {
    return {};
  }

  const policy: Record<string, PermissionsPolicyValue> = {};
  const directives = header.split(",");

  for (const directive of directives) {
    const trimmed = directive.trim();
    const eqIndex = trimmed.indexOf("=");

    if (eqIndex === -1) {
      continue;
    }

    const feature = trimmed.slice(0, eqIndex).trim();
    const valueStr = trimmed.slice(eqIndex + 1).trim();

    if (valueStr === "*") {
      policy[feature] = true;
    } else if (valueStr === "()") {
      policy[feature] = false;
    } else if (valueStr.startsWith("(") && valueStr.endsWith(")")) {
      const origins = valueStr
        .slice(1, -1)
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean);
      policy[feature] = origins;
    } else {
      policy[feature] = valueStr;
    }
  }

  return policy;
}
