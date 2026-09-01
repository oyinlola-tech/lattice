/**
 * Permission string parsing and wildcard matching.
 *
 * @module permission/permission
 */

import type { Permission } from "../permissionTypes/index.js";
import { InvalidPermissionError } from "../permissionErrors/index.js";

/** Regex for valid permission format: resource:action (supports namespaces and wildcards). */
const PERMISSION_REGEX = /^[a-zA-Z0-9._*-]+:[a-zA-Z0-9._*-]+$/;

/**
 * Parse a permission string into a structured Permission.
 *
 * @example parsePermission("post:update") → { resource: "post", action: "update" }
 * @example parsePermission("billing.invoice:refund") → { resource: "billing.invoice", action: "refund" }
 */
export function parsePermission(permission: string): Permission {
  if (!PERMISSION_REGEX.test(permission)) {
    throw new InvalidPermissionError(permission);
  }
  const lastColon = permission.lastIndexOf(":");
  const resource = permission.slice(0, lastColon);
  const action = permission.slice(lastColon + 1);
  return Object.freeze({ resource, action });
}

/**
 * Check if a permission string is valid without throwing.
 */
export function isValidPermission(permission: string): boolean {
  return PERMISSION_REGEX.test(permission);
}

/**
 * Check if a permission matches a target permission, supporting wildcards.
 *
 * @example matches("post:*", "post:update") → true
 * @example matches("*:*", "anything:goes") → true
 * @example matches("post:read", "post:update") → false
 */
export function matches(pattern: string, target: string): boolean {
  if (pattern === "*:*") return true;

  const patternParsed = parsePermissionSafe(pattern);
  const targetParsed = parsePermissionSafe(target);

  if (!patternParsed || !targetParsed) return false;

  const resourceMatch =
    patternParsed.resource === "*" ||
    patternParsed.resource === targetParsed.resource;

  const actionMatch =
    patternParsed.action === "*" ||
    patternParsed.action === targetParsed.action;

  return resourceMatch && actionMatch;
}

/**
 * Check if a permission string matches a structured Permission object.
 */
export function matchesPermission(
  pattern: string,
  permission: Permission,
): boolean {
  const parsed = parsePermissionSafe(pattern);
  if (!parsed) return false;

  const resourceMatch =
    parsed.resource === "*" || parsed.resource === permission.resource;

  const actionMatch =
    parsed.action === "*" || parsed.action === permission.action;

  return resourceMatch && actionMatch;
}

/**
 * Parse a permission string, returning null on invalid format instead of throwing.
 */
function parsePermissionSafe(permission: string): Permission | null {
  if (!PERMISSION_REGEX.test(permission)) return null;
  const lastColon = permission.lastIndexOf(":");
  const resource = permission.slice(0, lastColon);
  const action = permission.slice(lastColon + 1);
  return { resource, action };
}
