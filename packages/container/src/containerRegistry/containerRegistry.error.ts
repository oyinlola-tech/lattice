/**
 * Error classes for the container registry.
 */

import type {
  InjectionToken,
  Token,
} from "../containerToken/containerToken.type.js";

import {
  unwrapToken,
} from "../containerToken/containerToken.type.js";

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

/**
 * Error thrown when a registration already exists and
 * duplicate registrations are disabled.
 */
export class DuplicateRegistrationError extends Error {
  readonly code = "CONTAINER_DUPLICATE_REGISTRATION";
  readonly token: Token<unknown>;

  constructor(token: Token<unknown>) {
    super(`A registration already exists for token: ${describeRegistryToken(token)}.`);
    this.name = "DuplicateRegistrationError";
    this.token = token;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when attempting to modify a registration
 * that does not exist.
 */
export class RegistrationNotFoundError extends Error {
  readonly code = "CONTAINER_REGISTRATION_NOT_FOUND";
  readonly token: Token<unknown>;

  constructor(token: Token<unknown>) {
    super(`No registration exists for token: ${describeRegistryToken(token)}.`);
    this.name = "RegistrationNotFoundError";
    this.token = token;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
