/**
 * Response semantics helpers.
 *
 * Determines whether a status code allows a body, is cacheable by default,
 * or is retryable.
 */

import { STATUS } from "./httpStatus.statusConstant.js";

export function hasResponseBody(
  status:
    | number,
):
  | boolean {
  return !(
    status ===
      204 ||
    status ===
      304 ||
    status ===
      205
  );
}

export function isCacheableByDefault(
  status:
    | number,
):
  | boolean {
  switch (
    status
  ) {
    case 200:
    case 203:
    case 204:
    case 206:
    case 300:
    case 301:
    case 308:
    case 404:
    case 405:
    case 410:
    case 414:
    case 501:
      return true;

    default:
      return false;
  }
}

export function isRetryableStatus(
  status:
    | number,
):
  | boolean {
  return (
    status ===
      STATUS.REQUEST_TIMEOUT ||
    status ===
      STATUS.TOO_EARLY ||
    status ===
      STATUS.TOO_MANY_REQUESTS ||
    status ===
      STATUS.INTERNAL_SERVER_ERROR ||
    status ===
      STATUS.BAD_GATEWAY ||
    status ===
      STATUS.SERVICE_UNAVAILABLE ||
    status ===
      STATUS.GATEWAY_TIMEOUT
  );
}
