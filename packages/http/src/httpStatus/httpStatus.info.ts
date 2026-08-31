/**
 * Comprehensive status information.
 *
 * {@link getStatusInfo} builds a rich {@link HttpStatusInfo} object that
 * combines text, category, and all predicate results for a given code.
 */

import type { HttpStatusCategory } from "./httpStatus.type.js";
import { getStatusText, getStatusCategory } from "./httpStatus.lookup.js";
import { assertValidStatusCode } from "./httpStatus.validator.js";
import {
  isInformational,
  isSuccess,
  isRedirection,
  isClientError,
  isServerError,
  isError,
} from "./httpStatus.categoryPredicate.js";
import {
  hasResponseBody,
  isCacheableByDefault,
  isRetryableStatus,
} from "./httpStatus.semantics.js";
import { statusName } from "./httpStatus.name.js";

export interface HttpStatusInfo {
  readonly code:
    | number;

  readonly name:
    | string;

  readonly text:
    | string;

  readonly category:
    | HttpStatusCategory;

  readonly informational:
    | boolean;

  readonly success:
    | boolean;

  readonly redirection:
    | boolean;

  readonly clientError:
    | boolean;

  readonly serverError:
    | boolean;

  readonly error:
    | boolean;

  readonly bodyAllowed:
    | boolean;

  readonly cacheableByDefault:
    | boolean;

  readonly retryable:
    | boolean;
}

export function getStatusInfo(
  status:
    | number,
):
  | HttpStatusInfo {
  assertValidStatusCode(
    status,
  );

  const category =
    getStatusCategory(
      status,
    );

  return Object.freeze({
    code:
      status,

    name:
      statusName(
        status,
      ),

    text:
      getStatusText(
        status,
      ),

    category,

    informational:
      isInformational(
        status,
      ),

    success:
      isSuccess(
        status,
      ),

    redirection:
      isRedirection(
        status,
      ),

    clientError:
      isClientError(
        status,
      ),

    serverError:
      isServerError(
        status,
      ),

    error:
      isError(
        status,
      ),

    bodyAllowed:
      hasResponseBody(
        status,
      ),

    cacheableByDefault:
      isCacheableByDefault(
        status,
      ),

    retryable:
      isRetryableStatus(
        status,
      ),
  });
}
