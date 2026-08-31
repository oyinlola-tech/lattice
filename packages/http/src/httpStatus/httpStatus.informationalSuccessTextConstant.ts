/**
 * 1xx and 2xx HTTP status reason phrases.
 *
 * Informational and success status text constants.
 */

export const INFORMATIONAL_STATUS_TEXT = Object.freeze({
  100:
    "Continue",

  101:
    "Switching Protocols",

  102:
    "Processing",

  103:
    "Early Hints",
} as const);

export const SUCCESS_STATUS_TEXT = Object.freeze({
  200:
    "OK",

  201:
    "Created",

  202:
    "Accepted",

  203:
    "Non-Authoritative Information",

  204:
    "No Content",

  205:
    "Reset Content",

  206:
    "Partial Content",

  207:
    "Multi-Status",

  208:
    "Already Reported",

  226:
    "IM Used",
} as const);
