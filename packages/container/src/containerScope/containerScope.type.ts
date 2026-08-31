/**
 * Defines how long a dependency instance should live inside the dependency injection container.
 */

export enum ContainerScope {
  SINGLETON = "singleton",
  SCOPED = "scoped",
  TRANSIENT = "transient",
}

export const DEFAULT_CONTAINER_SCOPE: ContainerScope = ContainerScope.TRANSIENT;

export function isContainerScope(value: unknown): value is ContainerScope {
  return value === ContainerScope.SINGLETON || value === ContainerScope.SCOPED || value === ContainerScope.TRANSIENT;
}

export function resolveContainerScope(scope?: ContainerScope): ContainerScope { return scope ?? DEFAULT_CONTAINER_SCOPE; }
export function isSingletonScope(scope: ContainerScope): boolean { return scope === ContainerScope.SINGLETON; }
export function isScopedScope(scope: ContainerScope): boolean { return scope === ContainerScope.SCOPED; }
export function isTransientScope(scope: ContainerScope): boolean { return scope === ContainerScope.TRANSIENT; }

export function isCachedScope(scope: ContainerScope): boolean {
  return scope === ContainerScope.SINGLETON || scope === ContainerScope.SCOPED;
}

export function describeContainerScope(scope: ContainerScope): string {
  switch (scope) {
    case ContainerScope.SINGLETON: return "One instance shared by the root container.";
    case ContainerScope.SCOPED: return "One instance shared within the current container scope.";
    case ContainerScope.TRANSIENT: return "A new instance is created for every resolution.";
    default: return "Unknown container scope.";
  }
}
