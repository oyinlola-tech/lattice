/**
 * Serialization error classes — re-exports from focused files.
 */

export {
  SerializationError,
  createSerializationError,
  isSerializationError,
  toSerializationError,
} from "./serializationError.base.js";
export type { SerializationErrorOptions } from "./serializationError.base.js";

export {
  SerializeError,
  DeserializeError,
  UnsupportedSerializationFormatError,
  SerializerNotFoundError,
  CircularReferenceError,
  SerializationDepthError,
  SerializationPayloadTooLargeError,
  InvalidSerializedDataError,
  TransformerError,
  TransformerNotFoundError,
} from "./serializationError.types.js";
