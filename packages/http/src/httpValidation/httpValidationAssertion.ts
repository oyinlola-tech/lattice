/**
 * HTTP validation assertions.
 *
 * Throws on invalid HTTP values for use in strict validation paths.
 */

import {
  validateHeader,
} from "./httpValidationHeader.js";
import {
  validateURL,
} from "./httpValidationUrl.js";
import {
  isValidStatusCode,
} from "./httpValidationStatusCode.js";

export function assertValidHeader(
  name: string,
  value: string,
): void {
  const result =
    validateHeader(
      name,
      value,
    );

  if (
    !result.valid
  ) {
    throw new TypeError(
      result.reason ??
        "Invalid HTTP header.",
    );
  }
}

export function assertValidURL(
  value: string,
): void {
  const result =
    validateURL(
      value,
    );

  if (
    !result.valid
  ) {
    throw new TypeError(
      result.reason ??
        "Invalid URL.",
    );
  }
}

export function assertValidStatusCode(
  status: number,
): void {
  if (
    !isValidStatusCode(
      status,
    )
  ) {
    throw new RangeError(
      `Invalid HTTP status code: ${status}`,
    );
  }
}
