/**
 * Redirect-related status predicates.
 *
 * Tests a numeric status against well-known redirect codes (3xx).
 */

import { STATUS } from "./httpStatus.statusConstant.js";

export function isRedirect(status: number): boolean {
  return (
    status === STATUS.MOVED_PERMANENTLY ||
    status === STATUS.FOUND ||
    status === STATUS.SEE_OTHER ||
    status === STATUS.TEMPORARY_REDIRECT ||
    status === STATUS.PERMANENT_REDIRECT
  );
}

export function isPermanentRedirect(status: number): boolean {
  return (
    status === STATUS.MOVED_PERMANENTLY || status === STATUS.PERMANENT_REDIRECT
  );
}

export function isTemporaryRedirect(status: number): boolean {
  return (
    status === STATUS.FOUND ||
    status === STATUS.SEE_OTHER ||
    status === STATUS.TEMPORARY_REDIRECT
  );
}

export function isNotModified(status: number): boolean {
  return status === STATUS.NOT_MODIFIED;
}
