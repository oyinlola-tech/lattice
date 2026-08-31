/**
 * Branded type utilities and common domain identifier types.
 *
 * @module common/common
 */

/**
 * Create a branded type from a base type.
 *
 * Brands prevent accidental assignment between structurally identical types
 * (e.g. a UserId cannot be passed where an EventId is expected).
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** Unique entity identifier string. */
export type EntityId = string;

/** User identifier. */
export type UserId = Brand<EntityId, "UserId">;

/** Event identifier. */
export type EventId = Brand<EntityId, "EventId">;

/** Request identifier. */
export type RequestId = Brand<EntityId, "RequestId">;

/** Correlation identifier for distributed tracing. */
export type CorrelationId = Brand<EntityId, "CorrelationId">;

/** Session identifier. */
export type SessionId = Brand<EntityId, "SessionId">;

/** Tenant or organization identifier. */
export type TenantId = Brand<EntityId, "TenantId">;

/** Message identifier. */
export type MessageId = Brand<EntityId, "MessageId">;

/** Message causation identifier. */
export type MessageCausationId = Brand<EntityId, "MessageCausationId">;

/** Authentication token identifier. */
export type TokenId = Brand<EntityId, "TokenId">;

/** ISO 8601 timestamp string. */
export type Timestamp = Brand<string, "Timestamp">;

/** URL string. */
export type Url = Brand<string, "Url">;

/** Email address string. */
export type EmailAddress = Brand<string, "EmailAddress">;

/** Hex-encoded string. */
export type HexString = Brand<string, "HexString">;

/** Base64-encoded string. */
export type Base64String = Brand<string, "Base64String">;

/** JSON-serialized string. */
export type JsonString = Brand<string, "JsonString">;
