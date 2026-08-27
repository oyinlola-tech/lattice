/**
 * Error classes for dependency resolution.
 */

import type {
  Token,
} from "../containerToken/containerToken.type.js";

import {
  describeToken,
} from "../containerToken/containerToken.type.js";

import type {
  ResolutionPath,
} from "./containerResolution.type.js";

/**
 * Error thrown when circular dependency resolution is detected.
 */
export class CircularDependencyError extends Error {
  readonly code = "CONTAINER_CIRCULAR_DEPENDENCY";
  readonly path: ResolutionPath;

  constructor(path: ResolutionPath) {
    const formatted = path.map((token) => describeToken(token)).join(" -> ");
    super(`Circular dependency detected: ${formatted}.`);
    this.name = "CircularDependencyError";
    this.path = path;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when a provider cannot be resolved.
 */
export class ProviderResolutionError extends Error {
  readonly code = "CONTAINER_PROVIDER_RESOLUTION_FAILED";
  readonly token: Token<unknown>;
  public override readonly name: string = "ProviderResolutionError";

  constructor(token: Token<unknown>, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Failed to resolve provider for ${describeToken(token)}: ${message}`, { cause });
    this.token = token;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
