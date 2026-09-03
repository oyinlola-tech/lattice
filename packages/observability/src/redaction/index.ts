/**
 * @zudoliblib/observability — Redaction
 *
 * Sensitive field redaction for logs and traces.
 */

export {
  createRedactor,
  redactObject,
  isSensitiveField,
} from "./redaction.core.js";
