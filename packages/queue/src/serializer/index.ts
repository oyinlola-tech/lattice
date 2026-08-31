/**
 * Serializer abstraction for job payloads.
 *
 * Provides serialization and deserialization of job data
 * with JSON and passthrough implementations.
 */
export {
  JsonSerializer,
  createJsonSerializer,
  PassthroughSerializer,
} from "./serializer.core.js";

export type { Serializer } from "./serializer.type.js";
