/**
 * HTTP Authorization header validation.
 *
 * Validates Authorization header format (scheme credentials) per RFC 7235.
 */

import { isHTTPToken } from "./httpValidationToken.js";
import {
  isValidHeaderValue,
} from "./httpValidationHeader.js";

export function isValidAuthorization(
  value:
    | string
    | undefined
    | null,
): boolean {
  if (
    !value
  ) {
    return false;
  }

  const separator =
    value.indexOf(
      " ",
    );

  if (
    separator <=
      0
  ) {
    return false;
  }

  const scheme =
    value.slice(
      0,
      separator,
    );

  const credentials =
    value.slice(
      separator + 1,
    );

  return (
    isHTTPToken(
      scheme,
    ) &&
    credentials.trim()
      .length >
      0 &&
    isValidHeaderValue(
      value,
    )
  );
}
