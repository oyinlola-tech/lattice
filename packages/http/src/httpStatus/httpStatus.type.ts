/**
 * HTTP status code type definitions.
 *
 * Provides union types for each status class (1xx–5xx) and the
 * combined {@link HttpStatusCode} union, plus the
 * {@link HttpStatusCategory} string literal type.
 */

export type HttpStatusCode =
  | InformationalStatus
  | SuccessStatus
  | RedirectionStatus
  | ClientErrorStatus
  | ServerErrorStatus;

export type InformationalStatus =
  | 100
  | 101
  | 102
  | 103;

export type SuccessStatus =
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226;

export type RedirectionStatus =
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 307
  | 308;

export type ClientErrorStatus =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451;

export type ServerErrorStatus =
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;

export type HttpStatusCategory =
  | "informational"
  | "success"
  | "redirection"
  | "client-error"
  | "server-error"
  | "unknown";
