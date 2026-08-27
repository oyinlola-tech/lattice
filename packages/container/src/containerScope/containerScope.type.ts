/**
 * Defines how long a dependency instance should live
 * inside the dependency injection container.
 */
export enum ContainerScope {
  /**
   * One instance for the lifetime of the root container.
   *
   * Every resolution returns the same instance.
   */
  SINGLETON = "singleton",

  /**
   * One instance for the lifetime of the current
   * child/scope container.
   *
   * Different scopes receive different instances.
   */
  SCOPED = "scoped",

  /**
   * A new instance is created every time the dependency
   * is resolved.
   */
  TRANSIENT = "transient",
}

/**
 * The default dependency lifetime.
 */
export const DEFAULT_CONTAINER_SCOPE:
  ContainerScope =
  ContainerScope.TRANSIENT;

/**
 * Determines whether a value is a valid ContainerScope.
 */
export function isContainerScope(
  value:
    unknown,
):
  value is ContainerScope {
  return (
    value ===
      ContainerScope.SINGLETON ||
    value ===
      ContainerScope.SCOPED ||
    value ===
      ContainerScope.TRANSIENT
  );
}

/**
 * Resolves a container scope from an optional value.
 *
 * Undefined values fall back to the framework default.
 */
export function resolveContainerScope(
  scope?:
    ContainerScope,
):
  ContainerScope {
  return (
    scope ??
    DEFAULT_CONTAINER_SCOPE
  );
}

/**
 * Determines whether the supplied scope is singleton.
 */
export function isSingletonScope(
  scope:
    ContainerScope,
):
  boolean {
  return (
    scope ===
    ContainerScope.SINGLETON
  );
}

/**
 * Determines whether the supplied scope is scoped.
 */
export function isScopedScope(
  scope:
    ContainerScope,
):
  boolean {
  return (
    scope ===
    ContainerScope.SCOPED
  );
}

/**
 * Determines whether the supplied scope is transient.
 */
export function isTransientScope(
  scope:
    ContainerScope,
):
  boolean {
  return (
    scope ===
    ContainerScope.TRANSIENT
  );
}

/**
 * Determines whether a scope requires an instance cache.
 *
 * Singleton and scoped dependencies are cached.
 * Transient dependencies are not.
 */
export function isCachedScope(
  scope:
    ContainerScope,
):
  boolean {
  return (
    scope ===
      ContainerScope.SINGLETON ||
    scope ===
      ContainerScope.SCOPED
  );
}

/**
 * Returns a human-readable description of a container scope.
 */
export function describeContainerScope(
  scope:
    ContainerScope,
):
  string {
  switch (scope) {
    case ContainerScope.SINGLETON:
      return (
        "One instance shared by the root container."
      );

    case ContainerScope.SCOPED:
      return (
        "One instance shared within the current container scope."
      );

    case ContainerScope.TRANSIENT:
      return (
        "A new instance is created for every resolution."
      );

    default:
      return (
        "Unknown container scope."
      );
  }
}