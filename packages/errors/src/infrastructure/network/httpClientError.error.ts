/**
 * HTTP client error classes (4xx status codes).
 *
 * These errors carry enough information for the HTTP layer to translate
 * failures into consistent responses without coupling the errors to a
 * particular server adapter.
 */

import { HttpError } from "./http.error.js";
import type { ErrorMetadata } from "../../base/core/errorMetadata.core.js";

/**
 * Options for creating an HTTP client error.
 */
export interface HttpClientErrorOptions {
  readonly cause?: unknown;
  readonly code?: string;
  readonly expose?: boolean;
  readonly metadata?: ErrorMetadata;
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(
    message: string = "Bad Request",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 400,
      code: options.code ?? "BAD_REQUEST",
    });
    this.name = "BadRequestError";
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(
    message: string = "Unauthorized",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 401,
      code: options.code ?? "UNAUTHORIZED",
    });
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(
    message: string = "Forbidden",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 403,
      code: options.code ?? "FORBIDDEN",
    });
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found - HTTP specific
 */
export class HttpNotFoundError extends HttpError {
  constructor(
    message: string = "Not Found",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 404,
      code: options.code ?? "NOT_FOUND",
    });
    this.name = "HttpNotFoundError";
  }
}

/**
 * 405 Method Not Allowed
 */
export class MethodNotAllowedError extends HttpError {
  readonly methods: readonly string[];

  constructor(
    methods: readonly string[] = [],
    message: string = "Method Not Allowed",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 405,
      code: options.code ?? "METHOD_NOT_ALLOWED",
    });
    this.name = "MethodNotAllowedError";
    this.methods = methods;
  }
}

/**
 * 406 Not Acceptable
 */
export class NotAcceptableError extends HttpError {
  constructor(
    message: string = "Not Acceptable",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 406,
      code: options.code ?? "NOT_ACCEPTABLE",
    });
    this.name = "NotAcceptableError";
  }
}

/**
 * 408 Request Timeout
 */
export class RequestTimeoutError extends HttpError {
  constructor(
    message: string = "Request Timeout",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 408,
      code: options.code ?? "REQUEST_TIMEOUT",
    });
    this.name = "RequestTimeoutError";
  }
}

/**
 * 409 Conflict - HTTP specific
 */
export class HttpConflictError extends HttpError {
  constructor(
    message: string = "Conflict",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 409,
      code: options.code ?? "CONFLICT",
    });
    this.name = "HttpConflictError";
  }
}

/**
 * 410 Gone
 */
export class GoneError extends HttpError {
  constructor(
    message: string = "Gone",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 410,
      code: options.code ?? "GONE",
    });
    this.name = "GoneError";
  }
}

/**
 * 411 Length Required
 */
export class LengthRequiredError extends HttpError {
  constructor(
    message: string = "Length Required",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 411,
      code: options.code ?? "LENGTH_REQUIRED",
    });
    this.name = "LengthRequiredError";
  }
}

/**
 * 413 Payload Too Large
 */
export class PayloadTooLargeError extends HttpError {
  constructor(
    message: string = "Payload Too Large",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 413,
      code: options.code ?? "PAYLOAD_TOO_LARGE",
    });
    this.name = "PayloadTooLargeError";
  }
}

/**
 * 414 URI Too Long
 */
export class URITooLongError extends HttpError {
  constructor(
    message: string = "URI Too Long",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 414,
      code: options.code ?? "URI_TOO_LONG",
    });
    this.name = "URITooLongError";
  }
}

/**
 * 415 Unsupported Media Type
 */
export class UnsupportedMediaTypeError extends HttpError {
  constructor(
    message: string = "Unsupported Media Type",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 415,
      code: options.code ?? "UNSUPPORTED_MEDIA_TYPE",
    });
    this.name = "UnsupportedMediaTypeError";
  }
}

/**
 * 416 Range Not Satisfiable
 */
export class RangeNotSatisfiableError extends HttpError {
  constructor(
    message: string = "Range Not Satisfiable",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 416,
      code: options.code ?? "RANGE_NOT_SATISFIABLE",
    });
    this.name = "RangeNotSatisfiableError";
  }
}

/**
 * 417 Expectation Failed
 */
export class ExpectationFailedError extends HttpError {
  constructor(
    message: string = "Expectation Failed",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 417,
      code: options.code ?? "EXPECTATION_FAILED",
    });
    this.name = "ExpectationFailedError";
  }
}

/**
 * 422 Unprocessable Entity
 */
export class UnprocessableEntityError extends HttpError {
  constructor(
    message: string = "Unprocessable Entity",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 422,
      code: options.code ?? "UNPROCESSABLE_ENTITY",
    });
    this.name = "UnprocessableEntityError";
  }
}

/**
 * 423 Locked
 */
export class LockedError extends HttpError {
  constructor(
    message: string = "Locked",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 423,
      code: options.code ?? "LOCKED",
    });
    this.name = "LockedError";
  }
}

/**
 * 424 Failed Dependency
 */
export class FailedDependencyError extends HttpError {
  constructor(
    message: string = "Failed Dependency",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 424,
      code: options.code ?? "FAILED_DEPENDENCY",
    });
    this.name = "FailedDependencyError";
  }
}

/**
 * 425 Too Early
 */
export class TooEarlyError extends HttpError {
  constructor(
    message: string = "Too Early",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 425,
      code: options.code ?? "TOO_EARLY",
    });
    this.name = "TooEarlyError";
  }
}

/**
 * 426 Upgrade Required
 */
export class UpgradeRequiredError extends HttpError {
  constructor(
    message: string = "Upgrade Required",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 426,
      code: options.code ?? "UPGRADE_REQUIRED",
    });
    this.name = "UpgradeRequiredError";
  }
}

/**
 * 428 Precondition Required
 */
export class PreconditionRequiredError extends HttpError {
  constructor(
    message: string = "Precondition Required",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 428,
      code: options.code ?? "PRECONDITION_REQUIRED",
    });
    this.name = "PreconditionRequiredError";
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends HttpError {
  constructor(
    message: string = "Too Many Requests",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 429,
      code: options.code ?? "TOO_MANY_REQUESTS",
    });
    this.name = "TooManyRequestsError";
  }
}

/**
 * 431 Request Header Fields Too Large
 */
export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(
    message: string = "Request Header Fields Too Large",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 431,
      code: options.code ?? "REQUEST_HEADER_FIELDS_TOO_LARGE",
    });
    this.name = "RequestHeaderFieldsTooLargeError";
  }
}

/**
 * 499 Request Aborted
 */
export class RequestAbortedError extends HttpError {
  constructor(
    message: string = "Request Aborted",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 499,
      code: options.code ?? "REQUEST_ABORTED",
    });
    this.name = "RequestAbortedError";
  }
}

/**
 * 408 Request Body Timeout
 */
export class RequestBodyTimeoutError extends HttpError {
  constructor(
    message: string = "Request Body Timeout",
    options: HttpClientErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 408,
      code: options.code ?? "REQUEST_BODY_TIMEOUT",
    });
    this.name = "RequestBodyTimeoutError";
  }
}

/**
 * 400 Unsupported Protocol
 */
export class UnsupportedProtocolError extends HttpError {
  readonly protocol: string | undefined;

  constructor(
    protocol?: string,
    options: HttpClientErrorOptions = {},
  ) {
    super(
      protocol
        ? `Unsupported protocol "${protocol}".`
        : "Unsupported protocol.",
      {
        ...options,
        statusCode: 400,
        code: options.code ?? "UNSUPPORTED_PROTOCOL",
      },
    );
    this.name = "UnsupportedProtocolError";
    this.protocol = protocol;
  }
}

/**
 * 400 Invalid Header
 */
export class InvalidHeaderError extends HttpError {
  readonly header: string | undefined;

  constructor(
    header?: string,
    message?: string,
    options: HttpClientErrorOptions = {},
  ) {
    super(
      message ??
        (header
          ? `Invalid HTTP header "${header}".`
          : "Invalid HTTP header."),
      {
        ...options,
        statusCode: 400,
        code: options.code ?? "INVALID_HEADER",
      },
    );
    this.name = "InvalidHeaderError";
    this.header = header;
  }
}

/**
 * 415 Invalid Content Type
 */
export class InvalidContentTypeError extends HttpError {
  readonly contentType: string | undefined;

  constructor(
    contentType?: string,
    options: HttpClientErrorOptions = {},
  ) {
    super(
      contentType
        ? `Invalid content type "${contentType}".`
        : "Invalid content type.",
      {
        ...options,
        statusCode: 415,
        code: options.code ?? "INVALID_CONTENT_TYPE",
      },
    );
    this.name = "InvalidContentTypeError";
    this.contentType = contentType;
  }
}
