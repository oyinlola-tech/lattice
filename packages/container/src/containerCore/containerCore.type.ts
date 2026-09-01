/**
 * Types for the core container.
 */

import type { RegistrationToken } from "../containerRegistration/containerRegistration.core.js";

import type { ContainerRegistration } from "../containerRegistration/containerRegistration.core.js";

/**
 * Options used when creating a child container scope.
 */
export interface ContainerScopeOptions {
  /**
   * Optional name for the child scope.
   */
  readonly name?: string;

  /**
   * Optional metadata for the scope.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Full Container interface including mixin methods.
 * Used by ContainerScopeContext to reference the parent container.
 */
export interface ContainerLike {
  readonly name: string;
  readonly resolver: {
    createScope(): import("../containerResolution/containerResolution.type.js").ResolutionCache;
    resolveDetailed(
      token: unknown,
      options: unknown,
    ): { token: unknown; value: unknown };
    canResolve(token: unknown): boolean;
  };
  readonly resolutionOptions: {
    autoRegisterClasses: boolean;
    detectCircularDependencies: boolean;
    maxResolutionDepth: number;
  };
  has<T>(token: RegistrationToken<T>): boolean;
  createScope(
    options?: ContainerScopeOptions,
  ): import("./containerCore.scope.js").ContainerScopeContext;
}
