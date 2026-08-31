/**
 * Options for creating HTTP client errors.
 */

import type { ErrorMetadata } from "../../base/core/errorMetadata.type.js";

export interface HttpClientErrorOptions {
  readonly cause?: unknown;
  readonly code?: string;
  readonly expose?: boolean;
  readonly metadata?: ErrorMetadata;
}
