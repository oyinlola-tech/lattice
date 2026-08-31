/**
 * 1xx and 2xx HTTP status codes.
 *
 * Informational (1xx) and success (2xx) status code constants.
 */

export const INFORMATIONAL_STATUS_CODES = Object.freeze({
  CONTINUE:
    100,

  SWITCHING_PROTOCOLS:
    101,

  PROCESSING:
    102,

  EARLY_HINTS:
    103,
} as const);

export const SUCCESS_STATUS_CODES = Object.freeze({
  OK:
    200,

  CREATED:
    201,

  ACCEPTED:
    202,

  NON_AUTHORITATIVE_INFORMATION:
    203,

  NO_CONTENT:
    204,

  RESET_CONTENT:
    205,

  PARTIAL_CONTENT:
    206,

  MULTI_STATUS:
    207,

  ALREADY_REPORTED:
    208,

  IM_USED:
    226,
} as const);
