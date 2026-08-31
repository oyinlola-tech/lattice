/**
 * Converts errors into safe, predictable serialized structures.
 */

import { BaseError } from "../base/core/baseError.core.js";
import type { ErrorMetadata } from "../base/core/errorMetadata.type.js";
import type { ErrorSerializerOptions, PublicErrorResponse, InternalErrorResponse } from "./errorSerializer.types.js";
import { normalizeUnknownError } from "./errorSerializer.factory.js";

export type { ErrorSerializerOptions, PublicErrorResponse, InternalErrorResponse } from "./errorSerializer.types.js";
export { createErrorSerializer, serializeError, serializePublicError, normalizeUnknownError } from "./errorSerializer.factory.js";

/** Converts errors into safe, predictable serialized structures. */
export class ErrorSerializer {
  private readonly includeStack: boolean;
  private readonly includeCause: boolean;
  private readonly includeMetadata: boolean;
  private readonly safeMessage: string;
  private readonly redactSensitiveData: boolean;

  constructor(options: ErrorSerializerOptions = {}) {
    this.includeStack = options.includeStack ?? false;
    this.includeCause = options.includeCause ?? false;
    this.includeMetadata = options.includeMetadata ?? true;
    this.safeMessage = options.safeMessage ?? "An unexpected error occurred.";
    this.redactSensitiveData = options.redactSensitiveData ?? true;
  }

  /** Serializes an error for internal logging or monitoring. */
  public serialize(error: BaseError): InternalErrorResponse {
    const serialized = error.toJSON();
    const result: InternalErrorResponse = {
      ...serialized,
      ...(this.includeStack ? {} : { stack: undefined }),
      ...(this.includeCause ? {} : { cause: undefined }),
      ...(this.includeMetadata ? {} : { metadata: {} }),
    };
    if (this.redactSensitiveData && result.metadata) {
      return {
        ...result,
        metadata: this.redactMetadata(result.metadata) as Readonly<ErrorMetadata>,
      };
    }
    return result;
  }

  /** Serializes an error for an untrusted API client. */
  public serializePublic(error: BaseError): PublicErrorResponse {
    const metadata = this.includeMetadata ? this.redactMetadata(error.metadata) : undefined;
    return {
      code: error.code,
      message: error.expose ? error.message : this.safeMessage,
      category: error.category,
      statusCode: error.statusCode,
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
    };
  }

  /** Serializes an unknown thrown value. */
  public serializeUnknown(value: unknown): InternalErrorResponse {
    return this.serialize(normalizeUnknownError(value));
  }

  /** Creates a public response from an unknown thrown value. */
  public serializeUnknownPublic(value: unknown): PublicErrorResponse {
    return this.serializePublic(normalizeUnknownError(value));
  }

  /** Removes commonly sensitive metadata fields. */
  private redactMetadata(metadata: Readonly<Record<string, unknown>>): Record<string, unknown> {
    const sensitiveKeys = new Set([
      "password", "passcode", "token", "accessToken", "refreshToken",
      "authorization", "cookie", "secret", "privateKey", "apiKey", "credential", "clientSecret",
    ]);
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      result[key] = sensitiveKeys.has(key) ? "[REDACTED]" : value;
    }
    return result;
  }
}
