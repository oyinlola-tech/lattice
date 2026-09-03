/**
 * @zudolib/serialization — Core type definitions.
 *
 * Defines the contracts that all serialization implementations
 * must satisfy. These types are serialization-specific and are
 * NOT available in @zudolib/types or @zudolib/constants.
 */

/** Supported serialization format identifiers. */
export type SerializationFormat =
  "json" | "text" | "binary" | "messagepack" | string;

/** The output of a serialization operation. */
export type SerializedValue = string | Uint8Array;

/** Options for serialization operations. */
export interface SerializeOptions {
  /** Pretty-print the output (JSON only). */
  readonly pretty?: boolean;
  /** Preserve special JS types (Date, BigInt, Map, Set, etc.). */
  readonly preserveTypes?: boolean;
  /** Maximum object depth before throwing. */
  readonly maxDepth?: number;
  /** Maximum serialized size in bytes. */
  readonly maxSize?: number;
  /** Indentation for pretty-print (default: 2). */
  readonly indent?: number;
}

/** Options for deserialization operations. */
export interface DeserializeOptions {
  /** Restore special JS types from tagged representations. */
  readonly preserveTypes?: boolean;
  /** Maximum object depth before throwing. */
  readonly maxDepth?: number;
  /** Throw on malformed or unexpected data. */
  readonly strict?: boolean;
  /** Allow prototype-polluting keys during reconstruction. */
  readonly allowUnsafeKeys?: boolean;
}

/** Metadata attached to serialized output. */
export interface SerializationMetadata {
  /** The format used (e.g., "json"). */
  readonly format: string;
  /** Schema version for forward/backward compatibility. */
  readonly version?: number;
  /** MIME content type (e.g., "application/json"). */
  readonly contentType?: string;
  /** Character encoding (e.g., "utf-8"). */
  readonly encoding?: string;
}

/** An envelope wrapping serialized data with metadata. */
export interface SerializedEnvelope {
  readonly metadata: SerializationMetadata;
  readonly data: SerializedValue;
}

/** Synchronous serializer contract. */
export interface Serializer<TValue = unknown, TSerialized = SerializedValue> {
  /** Canonical name for registry lookup (e.g., "json"). */
  readonly name: string;
  /** The MIME content type produced by this serializer. */
  readonly contentType: string;
  /** Serialize a value into the target format. */
  serialize(value: TValue, options?: SerializeOptions): TSerialized;
  /** Deserialize a value from the target format. */
  deserialize<T = TValue>(value: TSerialized, options?: DeserializeOptions): T;
}

/** Asynchronous serializer contract (for streaming / large payloads). */
export interface AsyncSerializer<
  TValue = unknown,
  TSerialized = SerializedValue,
> {
  readonly name: string;
  readonly contentType: string;
  serialize(value: TValue, options?: SerializeOptions): Promise<TSerialized>;
  deserialize<T = TValue>(
    value: TSerialized,
    options?: DeserializeOptions,
  ): Promise<T>;
}

/** Transforms a specific JS type during serialization. */
export interface TypeTransformer<TValue = unknown> {
  /** Tag name used in tagged representations (e.g., "Date"). */
  readonly type: string;
  /** Returns true when this transformer handles the given value. */
  canSerialize(value: unknown): value is TValue;
  /** Convert the value into a JSON-safe representation. */
  serialize(value: TValue): unknown;
  /** Reconstruct the original value from the serialized form. */
  deserialize(value: unknown): TValue;
}

/** Strategy for handling `undefined` values. */
export type UndefinedStrategy = "omit" | "null" | "preserve";
