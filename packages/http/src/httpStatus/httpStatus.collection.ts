/**
 * Frozen arrays of status codes grouped by category.
 *
 * Useful for membership checks or iteration over all codes in a class.
 */

export const INFORMATIONAL_STATUSES:
  | readonly number[] =
  Object.freeze([
    100,
    101,
    102,
    103,
  ]);

export const SUCCESS_STATUSES:
  | readonly number[] =
  Object.freeze([
    200,
    201,
    202,
    203,
    204,
    205,
    206,
    207,
    208,
    226,
  ]);

export const REDIRECTION_STATUSES:
  | readonly number[] =
  Object.freeze([
    300,
    301,
    302,
    303,
    304,
    305,
    307,
    308,
  ]);

export const CLIENT_ERROR_STATUSES:
  | readonly number[] =
  Object.freeze([
    400,
    401,
    402,
    403,
    404,
    405,
    406,
    407,
    408,
    409,
    410,
    411,
    412,
    413,
    414,
    415,
    416,
    417,
    418,
    421,
    422,
    423,
    424,
    425,
    426,
    428,
    429,
    431,
    451,
  ]);

export const SERVER_ERROR_STATUSES:
  | readonly number[] =
  Object.freeze([
    500,
    501,
    502,
    503,
    504,
    505,
    506,
    507,
    508,
    510,
    511,
  ]);
