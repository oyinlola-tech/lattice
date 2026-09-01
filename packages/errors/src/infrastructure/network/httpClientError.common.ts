/**
 * Common HTTP client error classes (400-417).
 */

import { HttpError } from "./http.error.js";
import type { HttpClientErrorOptions } from "./httpClientError.options.js";

/** 400 Bad Request */
export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 400,
      code: options.code ?? "BAD_REQUEST",
    });
    this.name = "BadRequestError";
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 401,
      code: options.code ?? "UNAUTHORIZED",
    });
    this.name = "UnauthorizedError";
  }
}

/** 403 Forbidden */
export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 403,
      code: options.code ?? "FORBIDDEN",
    });
    this.name = "ForbiddenError";
  }
}

/** 404 Not Found */
export class HttpNotFoundError extends HttpError {
  constructor(message = "Not Found", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 404,
      code: options.code ?? "NOT_FOUND",
    });
    this.name = "HttpNotFoundError";
  }
}

/** 405 Method Not Allowed */
export class MethodNotAllowedError extends HttpError {
  readonly methods: readonly string[];
  constructor(
    methods: readonly string[] = [],
    message = "Method Not Allowed",
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

/** 406 Not Acceptable */
export class NotAcceptableError extends HttpError {
  constructor(
    message = "Not Acceptable",
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

/** 408 Request Timeout */
export class RequestTimeoutError extends HttpError {
  constructor(
    message = "Request Timeout",
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

/** 409 Conflict */
export class HttpConflictError extends HttpError {
  constructor(message = "Conflict", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 409,
      code: options.code ?? "CONFLICT",
    });
    this.name = "HttpConflictError";
  }
}

/** 410 Gone */
export class GoneError extends HttpError {
  constructor(message = "Gone", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 410,
      code: options.code ?? "GONE",
    });
    this.name = "GoneError";
  }
}

/** 411 Length Required */
export class LengthRequiredError extends HttpError {
  constructor(
    message = "Length Required",
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

/** 413 Payload Too Large */
export class PayloadTooLargeError extends HttpError {
  constructor(
    message = "Payload Too Large",
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

/** 414 URI Too Long */
export class URITooLongError extends HttpError {
  constructor(message = "URI Too Long", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 414,
      code: options.code ?? "URI_TOO_LONG",
    });
    this.name = "URITooLongError";
  }
}

/** 415 Unsupported Media Type */
export class UnsupportedMediaTypeError extends HttpError {
  constructor(
    message = "Unsupported Media Type",
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

/** 416 Range Not Satisfiable */
export class RangeNotSatisfiableError extends HttpError {
  constructor(
    message = "Range Not Satisfiable",
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

/** 417 Expectation Failed */
export class ExpectationFailedError extends HttpError {
  constructor(
    message = "Expectation Failed",
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
