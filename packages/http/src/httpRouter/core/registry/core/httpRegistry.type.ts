/**
 * Route registry types.
 *
 * @module httpRoute/registry/types
 */

export interface RouteRegistryEntry {
  readonly path: string;
  readonly method: string;
  readonly handler: unknown;
  readonly options: RouteRegistrationOptions;
  readonly metadata: Record<string, unknown>;
}

export interface RouteRegistryOptions {
  readonly caseSensitive?: boolean;
  readonly strict?: boolean;
  readonly end?: boolean;
}

export interface RouteRegistrationOptions {
  readonly middleware?: readonly unknown[];
  readonly metadata?: Record<string, unknown>;
  readonly priority?: number;
}

export interface RouteLookupOptions {
  readonly method?: string;
  readonly path?: string;
  readonly includeMetadata?: boolean;
}

export interface RouteRegistrySnapshot {
  readonly routes: readonly RouteRegistryEntry[];
  readonly timestamp: number;
  readonly version: number;
}
