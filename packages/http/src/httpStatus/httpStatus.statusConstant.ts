/**
 * Combined numeric HTTP status codes mapped to symbolic names.
 *
 * Provides the {@link STATUS} map by composing per-class constants.
 * Grouped constants (INFORMATIONAL_STATUS_CODES, etc.) are exported
 * directly from {@link httpStatusCodes.constant} to avoid duplicates.
 */

import { INFORMATIONAL_STATUS_CODES, SUCCESS_STATUS_CODES } from "./httpStatus.informationalSuccessConstant.js";
import { REDIRECTION_STATUS_CODES, CLIENT_ERROR_STATUS_CODES, SERVER_ERROR_STATUS_CODES } from "./httpStatus.redirectErrorConstant.js";

export const STATUS = Object.freeze({
  ...INFORMATIONAL_STATUS_CODES,
  ...SUCCESS_STATUS_CODES,
  ...REDIRECTION_STATUS_CODES,
  ...CLIENT_ERROR_STATUS_CODES,
  ...SERVER_ERROR_STATUS_CODES,
} as const);
