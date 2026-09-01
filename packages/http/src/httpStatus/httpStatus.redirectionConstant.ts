/**
 * 3xx HTTP redirection status codes.
 */

export const REDIRECTION_STATUS_CODES = Object.freeze({
  MULTIPLE_CHOICES: 300,

  MOVED_PERMANENTLY: 301,

  FOUND: 302,

  SEE_OTHER: 303,

  NOT_MODIFIED: 304,

  USE_PROXY: 305,

  TEMPORARY_REDIRECT: 307,

  PERMANENT_REDIRECT: 308,
} as const);
