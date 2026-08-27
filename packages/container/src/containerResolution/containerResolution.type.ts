/**
 * Types for dependency resolution.
 */

import type {
  ContainerRegistration,
} from "../containerRegistration/containerRegistration.core.js";

import type {
  ContainerScope,
} from "../containerScope/containerScope.type.js";

import type {
  Token,
} from "../containerToken/containerToken.type.js";

/**
 * A cache containing resolved dependency instances.
 */
export type ResolutionCache = Map<Token<unknown>, unknown>;

/**
 * Dependency resolution path.
 * Used for diagnostics and circular dependency detection.
 */
export type ResolutionPath = readonly Token<unknown>[];

/**
 * Options controlling dependency resolution.
 */
export interface ResolutionOptions {
  /** Existing cache for the current resolution scope. */
  readonly cache?: ResolutionCache;
  /** Current dependency resolution path. Normally managed internally. */
  readonly path?: ResolutionPath;
  /** Whether to allow resolving unregistered classes directly from their constructors. Defaults to true. */
  readonly autoRegisterClasses?: boolean;
}

/**
 * Resolution result containing the resolved value and diagnostic information.
 */
export interface ResolutionResult<T> {
  readonly value: T;
  readonly token: Token<T>;
  readonly registration: ContainerRegistration<T>;
  readonly scope: ContainerScope;
  readonly fromCache: boolean;
  readonly path: ResolutionPath;
}
