/**
 * Specialized HTTP client errors with additional properties.
 */

import { HttpError } from "./http.error.js";
import type { HttpClientErrorOptions } from "./httpClientError.options.js";

/** 408 Request Body Timeout */
export class RequestBodyTimeoutError extends HttpError {
  constructor(
    message = "Request Body Timeout",
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

/** 400 Unsupported Protocol */
export class UnsupportedProtocolError extends HttpError {
  readonly protocol: string | undefined;
  constructor(protocol?: string, options: HttpClientErrorOptions = {}) {
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

/** 400 Invalid Header */
export class InvalidHeaderError extends HttpError {
  readonly header: string | undefined;
  constructor(
    header?: string,
    message?: string,
    options: HttpClientErrorOptions = {},
  ) {
    super(
      message ??
        (header ? `Invalid HTTP header "${header}".` : "Invalid HTTP header."),
      { ...options, statusCode: 400, code: options.code ?? "INVALID_HEADER" },
    );
    this.name = "InvalidHeaderError";
    this.header = header;
  }
}

/** 415 Invalid Content Type */
export class InvalidContentTypeError extends HttpError {
  readonly contentType: string | undefined;
  constructor(contentType?: string, options: HttpClientErrorOptions = {}) {
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
