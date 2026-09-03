/**
 * @zudo/container/containerRegistry/containerRegistry.error
 *
 * Error classes re-exported from @zudo/errors.
 * This file retains the token description helper used by the registry.
 */

import type {
  InjectionToken,
  Token,
} from "../containerToken/containerToken.type.js";

import { unwrapToken } from "../containerToken/containerToken.type.js";

/**
 * Describes a token for registry diagnostics.
 */
export function describeRegistryToken<T>(
  token: Token<T> | InjectionToken<T>,
): string {
  const normalized = unwrapToken(token);
  if (typeof normalized === "string") return normalized;
  if (typeof normalized === "symbol") {
    return normalized.description
      ? `Symbol(${normalized.description})`
      : "Symbol()";
  }
  return normalized.name || "AnonymousConstructor";
}
