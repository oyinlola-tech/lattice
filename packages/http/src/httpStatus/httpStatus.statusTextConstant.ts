/**
 * Combined numeric HTTP status codes mapped to reason phrases.
 *
 * Provides the {@link STATUS_TEXT} map by composing per-class constants.
 * Grouped text constants are exported from their dedicated leaf modules
 * to avoid duplicates with {@link httpStatusCodes.constant}.
 */

import {
  INFORMATIONAL_STATUS_TEXT,
  SUCCESS_STATUS_TEXT,
} from "./httpStatus.informationalSuccessTextConstant.js";
import {
  REDIRECTION_STATUS_TEXT,
  CLIENT_ERROR_STATUS_TEXT,
  SERVER_ERROR_STATUS_TEXT,
} from "./httpStatus.redirectErrorTextConstant.js";

export const STATUS_TEXT = Object.freeze({
  ...INFORMATIONAL_STATUS_TEXT,
  ...SUCCESS_STATUS_TEXT,
  ...REDIRECTION_STATUS_TEXT,
  ...CLIENT_ERROR_STATUS_TEXT,
  ...SERVER_ERROR_STATUS_TEXT,
} as const);
