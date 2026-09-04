/**
 * @zudojs/serialization — Serialization envelope.
 *
 * Wraps serialized data with metadata (format, version, encoding)
 * so consumers know how to deserialize the payload. Essential for
 * messaging, queues, RPC, and cross-service communication.
 */

import type {
  SerializedEnvelope,
  SerializationMetadata,
  SerializedValue,
} from "../serializerTypes/index.js";
import {
  SerializationFormat,
  SerializationContentType,
  SERIALIZATION_SCHEMA_VERSION,
} from "@zudojs/constants";
import { encodeUtf8, decodeUtf8 } from "../serializerTransformsExt/index.js";

/**
 * Create a serialization envelope wrapping data with metadata.
 *
 * @param data - The serialized data payload.
 * @param format - The serialization format used (default: "json").
 * @param options - Additional metadata options.
 * @returns A SerializedEnvelope with metadata and data.
 */
export function createEnvelope(
  data: SerializedValue,
  format: string = SerializationFormat.JSON,
  options: {
    readonly version?: number;
    readonly contentType?: string;
    readonly encoding?: string;
  } = {},
): SerializedEnvelope {
  return {
    metadata: {
      format,
      version: options.version ?? SERIALIZATION_SCHEMA_VERSION,
      contentType: options.contentType ?? SerializationContentType.JSON,
      encoding: options.encoding ?? "utf-8",
    },
    data,
  };
}

/**
 * Extract the data from an envelope, validating metadata.
 *
 * @param envelope - The envelope to unwrap.
 * @param expectedFormat - Optional format to validate against.
 * @returns The raw serialized data.
 * @throws {Error} when the envelope format doesn't match expectations.
 */
export function unwrapEnvelope(
  envelope: SerializedEnvelope,
  expectedFormat?: string,
): SerializedValue {
  if (expectedFormat && envelope.metadata.format !== expectedFormat) {
    throw new Error(
      `Envelope format mismatch: expected "${expectedFormat}", got "${envelope.metadata.format}"`,
    );
  }
  return envelope.data;
}

/**
 * Serialize a value and wrap it in an envelope.
 *
 * @param value - The value to serialize.
 * @param serializer - The serializer to use.
 * @param format - The format identifier for metadata.
 * @returns A SerializedEnvelope containing the serialized data.
 */
export function serializeToEnvelope<T>(
  value: T,
  serializer: { serialize: (v: T) => string },
  format: string = SerializationFormat.JSON,
): SerializedEnvelope {
  const data = serializer.serialize(value);
  return createEnvelope(data, format);
}

/**
 * Unwrap an envelope and deserialize the data.
 *
 * @param envelope - The envelope to unwrap.
 * @param deserializer - The deserializer to use.
 * @param expectedFormat - Optional format to validate against.
 * @returns The deserialized value.
 */
export function deserializeFromEnvelope<T>(
  envelope: SerializedEnvelope,
  deserializer: { deserialize: <U>(v: string) => U },
  expectedFormat?: string,
): T {
  const data = unwrapEnvelope(envelope, expectedFormat);
  const str = typeof data === "string" ? data : decodeUtf8(data);
  return deserializer.deserialize<T>(str);
}
