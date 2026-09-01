/**
 * @oyinlola141/lattice-serialization — Serialization envelope.
 *
 * Wraps serialized data with metadata for cross-service communication.
 */

export {
  createEnvelope,
  unwrapEnvelope,
  serializeToEnvelope,
  deserializeFromEnvelope,
} from "./envelope.core.js";
