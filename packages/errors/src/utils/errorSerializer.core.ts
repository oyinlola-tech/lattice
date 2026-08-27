import { BaseError } from "../base/core/baseError.core.js";
import type { SerializedBaseError } from "../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../base/types/errorCategory.type.js";

import {
  ErrorSeverity,
} from "../base/types/errorSeverity.type.js";

import type {
  ErrorMetadata,
} from "../base/core/errorMetadata.core.js";

/**
 * Options controlling error serialization.
 */
export interface ErrorSerializerOptions {
  /**
   * Include the stack trace in the serialized result.
   *
   * Defaults to false.
   */
  readonly includeStack?: boolean;

  /**
   * Include the error cause.
   *
   * Defaults to false.
   */
  readonly includeCause?: boolean;

  /**
   * Include internal metadata.
   *
   * Defaults to true for internal serialization.
   */
  readonly includeMetadata?: boolean;

  /**
   * Replace non-exposable error messages with a safe message.
   */
  readonly safeMessage?: string;

  /**
   * Remove sensitive metadata values.
   */
  readonly redactSensitiveData?: boolean;
}

/**
 * Public error representation suitable for an API response.
 */
export interface PublicErrorResponse {
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly statusCode: number;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Internal serialized error representation.
 */
export interface InternalErrorResponse
  extends SerializedBaseError {}

/**
 * Converts errors into safe, predictable serialized structures.
 */
export class ErrorSerializer {
  private readonly includeStack: boolean;

  private readonly includeCause: boolean;

  private readonly includeMetadata: boolean;

  private readonly safeMessage: string;

  private readonly redactSensitiveData: boolean;

  constructor(
    options: ErrorSerializerOptions = {},
  ) {
    this.includeStack =
      options.includeStack ??
      false;

    this.includeCause =
      options.includeCause ??
      false;

    this.includeMetadata =
      options.includeMetadata ??
      true;

    this.safeMessage =
      options.safeMessage ??
      "An unexpected error occurred.";

    this.redactSensitiveData =
      options.redactSensitiveData ??
      true;
  }

  /**
   * Serializes an error for internal logging or monitoring.
   */
  public serialize(
    error: BaseError,
  ): InternalErrorResponse {
    const serialized =
      error.toJSON();

    const result: InternalErrorResponse =
      {
        ...serialized,
        ...(this.includeStack
          ? {}
          : {
              stack:
                undefined,
            }),
        ...(this.includeCause
          ? {}
          : {
              cause:
                undefined,
            }),
        ...(this.includeMetadata
          ? {}
          : {
              metadata:
                {},
            }),
      };

    if (
      this.redactSensitiveData &&
      result.metadata
    ) {
      return {
        ...result,
        metadata:
          this.redactMetadata(
            result.metadata,
          ) as Readonly<ErrorMetadata>,
      };
    }

    return result;
  }

  /**
   * Serializes an error for an untrusted API client.
   */
  public serializePublic(
    error: BaseError,
  ): PublicErrorResponse {
    const metadata =
      this.includeMetadata
        ? this.redactMetadata(
            error.metadata,
          )
        : undefined;

    return {
      code:
        error.code,
      message:
        error.expose
          ? error.message
          : this.safeMessage,
      category:
        error.category,
      statusCode:
        error.statusCode,
      ...(metadata &&
      Object.keys(
        metadata,
      ).length > 0
        ? {
            metadata,
          }
        : {}),
    };
  }

  /**
   * Serializes an unknown thrown value.
   *
   * Non-BaseError values are normalized into a safe internal structure.
   */
  public serializeUnknown(
    value: unknown,
  ): InternalErrorResponse {
    const error =
      normalizeUnknownError(
        value,
      );

    return this.serialize(
      error,
    );
  }

  /**
   * Creates a public response from an unknown thrown value.
   */
  public serializeUnknownPublic(
    value: unknown,
  ): PublicErrorResponse {
    const error =
      normalizeUnknownError(
        value,
      );

    return this.serializePublic(
      error,
    );
  }

  /**
   * Removes commonly sensitive metadata fields.
   */
  private redactMetadata(
    metadata: Readonly<
      Record<string, unknown>
    >,
  ): Record<string, unknown> {
    const sensitiveKeys =
      new Set([
        "password",
        "passcode",
        "token",
        "accessToken",
        "refreshToken",
        "authorization",
        "cookie",
        "secret",
        "privateKey",
        "apiKey",
        "credential",
        "clientSecret",
      ]);

    const result: Record<
      string,
      unknown
    > = {};

    for (
      const [
        key,
        value,
      ] of Object.entries(
        metadata,
      )
    ) {
      if (
        sensitiveKeys.has(
          key,
        )
      ) {
        result[key] =
          "[REDACTED]";
        continue;
      }

      result[key] =
        value;
    }

    return result;
  }
}

/**
 * Creates an ErrorSerializer instance.
 */
export function createErrorSerializer(
  options: ErrorSerializerOptions = {},
): ErrorSerializer {
  return new ErrorSerializer(
    options,
  );
}

/**
 * Serializes a BaseError for internal use.
 */
export function serializeError(
  error: BaseError,
  options: ErrorSerializerOptions = {},
): InternalErrorResponse {
  return new ErrorSerializer(
    options,
  ).serialize(error);
}

/**
 * Serializes a BaseError for public API responses.
 */
export function serializePublicError(
  error: BaseError,
  options: ErrorSerializerOptions = {},
): PublicErrorResponse {
  return new ErrorSerializer(
    options,
  ).serializePublic(error);
}

/**
 * Converts an unknown thrown value into a BaseError.
 */
function normalizeUnknownError(
  value: unknown,
): BaseError {
  if (
    value instanceof BaseError
  ) {
    return value;
  }

  if (
    value instanceof Error
  ) {
    return new BaseError(
      value.message ||
        "An unexpected error occurred.",
      {
        code:
          "INTERNAL_ERROR",
        category:
          ErrorCategory.SYSTEM,
        severity:
          ErrorSeverity.ERROR,
        statusCode:
          500,
        expose:
          false,
        isOperational:
          false,
        cause:
          value,
      },
    );
  }

  return new BaseError(
    "An unexpected error occurred.",
    {
      code:
        "INTERNAL_ERROR",
      category:
        ErrorCategory.SYSTEM,
      severity:
        ErrorSeverity.ERROR,
      statusCode:
        500,
      expose:
        false,
      isOperational:
        false,
      metadata: {
        originalType:
          typeof value,
      },
    },
  );
}