/**
 * @oyinlola141/lattice-api/context-key
 *
 * Typed context keys for the API context system.
 *
 * Context keys allow type-safe storage and retrieval of values
 * from the API context without creating a god object.
 */

/**
 * A typed key for storing and retrieving values from the API context.
 */
export interface APIContextKey<T> {
  readonly name: string;
  readonly type: T;
}

/**
 * Creates a typed context key.
 */
export function createContextKey<T>(
  name: string,
): APIContextKey<T> {
  return Object.freeze({
    name,
    type: undefined as unknown as T,
  });
}

/**
 * Well-known context keys for common cross-cutting concerns.
 */
export const RequestIdContextKey = /* #__PURE__ */ createContextKey<string>("requestId");

export const CorrelationIdContextKey = /* #__PURE__ */ createContextKey<string>("correlationId");

export const TenantIdContextKey = /* #__PURE__ */ createContextKey<string>("tenantId");

export const UserIdContextKey = /* #__PURE__ */ createContextKey<string>("userId");

export const StartTimeContextKey = /* #__PURE__ */ createContextKey<number>("startTime");
