/**
 * Error serializer types and interfaces.
 */

import type { SerializedBaseError } from "../base/types/baseError.type.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";

/** Options controlling error serialization. */
export interface ErrorSerializerOptions {
  /** Include the stack trace in the serialized result. Defaults to false. */
  readonly includeStack?: boolean;
  /** Include the error cause. Defaults to false. */
  readonly includeCause?: boolean;
  /** Include internal metadata. Defaults to true for internal serialization. */
  readonly includeMetadata?: boolean;
  /** Replace non-exposable error messages with a safe message. */
  readonly safeMessage?: string;
  /** Remove sensitive metadata values. */
  readonly redactSensitiveData?: boolean;
}

/** Public error representation suitable for an API response. */
export interface PublicErrorResponse {
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly statusCode: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Internal serialized error representation. */
export interface InternalErrorResponse extends SerializedBaseError {}
