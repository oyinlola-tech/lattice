/**
 * Advanced HTTP client error classes (422+).
 */

import { HttpError } from "./http.error.js";
import type { HttpClientErrorOptions } from "./httpClientError.options.js";

/** 422 Unprocessable Entity */
export class UnprocessableEntityError extends HttpError {
  constructor(
    message = "Unprocessable Entity",
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

/** 423 Locked */
export class LockedError extends HttpError {
  constructor(message = "Locked", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 423,
      code: options.code ?? "LOCKED",
    });
    this.name = "LockedError";
  }
}

/** 424 Failed Dependency */
export class FailedDependencyError extends HttpError {
  constructor(
    message = "Failed Dependency",
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

/** 425 Too Early */
export class TooEarlyError extends HttpError {
  constructor(message = "Too Early", options: HttpClientErrorOptions = {}) {
    super(message, {
      ...options,
      statusCode: 425,
      code: options.code ?? "TOO_EARLY",
    });
    this.name = "TooEarlyError";
  }
}

/** 426 Upgrade Required */
export class UpgradeRequiredError extends HttpError {
  constructor(
    message = "Upgrade Required",
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

/** 428 Precondition Required */
export class PreconditionRequiredError extends HttpError {
  constructor(
    message = "Precondition Required",
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

/** 429 Too Many Requests */
export class TooManyRequestsError extends HttpError {
  constructor(
    message = "Too Many Requests",
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

/** 431 Request Header Fields Too Large */
export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(
    message = "Request Header Fields Too Large",
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

/** 499 Request Aborted */
export class RequestAbortedError extends HttpError {
  constructor(
    message = "Request Aborted",
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
