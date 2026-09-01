/**
 * Invalid JSON error class.
 *
 * @module httpErrors/invalidJson
 */

import { HttpError } from "./httpError.base.js";

/**
 * Error thrown when JSON parsing fails.
 */
export class InvalidJSONError extends HttpError {
  /**
   * The original parse error.
   */
  readonly parseError: unknown;

  constructor(
    message: string = "Invalid JSON",
    options: {
      readonly cause?: unknown;

      readonly details?: unknown;
    } = {},
  ) {
    super(400, message, {
      cause: options.cause,
      code: "INVALID_JSON",
      expose: true,
      details: options.details,
    });

    this.name = "InvalidJSONError";

    this.parseError = options.cause;
  }
}
