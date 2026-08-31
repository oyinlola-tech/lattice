/**
 * Error-related status predicates.
 *
 * Tests a numeric status against well-known 4xx and 5xx codes.
 */

import { STATUS } from "./httpStatus.statusConstant.js";

export function isOk(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.OK;
}

export function isCreated(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.CREATED;
}

export function isAccepted(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.ACCEPTED;
}

export function isNoContent(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.NO_CONTENT;
}

export function isPartialContent(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.PARTIAL_CONTENT;
}

export function isUnauthorized(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.UNAUTHORIZED;
}

export function isForbidden(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.FORBIDDEN;
}

export function isNotFound(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.NOT_FOUND;
}

export function isMethodNotAllowed(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.METHOD_NOT_ALLOWED;
}

export function isConflict(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.CONFLICT;
}

export function isUnprocessableEntity(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.UNPROCESSABLE_ENTITY;
}

export function isTooManyRequests(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.TOO_MANY_REQUESTS;
}

export function isInternalServerError(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.INTERNAL_SERVER_ERROR;
}

export function isServiceUnavailable(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.SERVICE_UNAVAILABLE;
}

export function isGatewayTimeout(
  status:
    | number,
):
  | boolean {
  return status ===
    STATUS.GATEWAY_TIMEOUT;
}
