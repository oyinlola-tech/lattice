/**
 * @zudojs/security — Rate Limit Namespace
 *
 * Convenience namespace for rate limiting utilities.
 */

import {
  defaultKeyGenerator,
  defaultHandler,
  createRateLimiter,
  extractClientIp,
} from "./rateLimit.core.js";

export const rateLimit = {
  defaultKeyGenerator,
  defaultHandler,
  createRateLimiter,
  extractClientIp,
};
