/**
 * @zudojs/security — Rate Limiting
 *
 * Implements sliding window rate limiting to prevent abuse.
 */

import type {
  RateLimitConfig,
  RateLimitRequest,
  RateLimitResult,
} from "../types/security.type.js";

/** Default rate limit: 100 requests per minute. */
const DEFAULT_MAX = 100;

/** Default window: 1 minute. */
const DEFAULT_WINDOW_MS = 60_000;

/** Default rate limit message. */
const DEFAULT_MESSAGE = "Too many requests";

/**
 * In-memory rate limit store.
 * Maps keys to arrays of timestamps.
 */
interface RateLimitEntry {
  readonly timestamps: number[];
  readonly windowStart: number;
}

/**
 * Default key generator using IP address.
 *
 * @param request - The rate limit request.
 * @returns The rate limit key.
 */
export function defaultKeyGenerator(request: RateLimitRequest): string {
  return request.ip ?? "unknown";
}

/**
 * Default handler when rate limit is exceeded.
 *
 * @param _request - The rate limit request.
 * @param response - The rate limit response to modify.
 */
export function defaultHandler(
  _request: RateLimitRequest,
  response: {
    statusCode: number;
    headers: Record<string, string>;
    body?: string;
  },
): void {
  response.statusCode = 429;
  response.headers["Retry-After"] = "60";
  response.headers["X-RateLimit-Remaining"] = "0";
  response.body = JSON.stringify({
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: DEFAULT_MESSAGE,
    },
  });
}

/**
 * Creates an in-memory rate limiter.
 *
 * @param config - Rate limit configuration.
 * @returns A function that checks rate limits.
 */
export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>();
  const keyGenerator = config.keyGenerator ?? defaultKeyGenerator;
  const handler = config.handler;
  const skip = config.skip;

  // Cleanup old entries periodically
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.windowStart > config.windowMs * 2) {
        store.delete(key);
      }
    }
  }, config.windowMs);

  // Allow cleanup to not keep process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  /**
   * Checks if a request is allowed and updates the counter.
   */
  function check(request: RateLimitRequest): RateLimitResult {
    // Skip if configured
    if (skip && skip(request)) {
      return {
        allowed: true,
        remaining: config.max,
        resetAt: new Date(Date.now() + config.windowMs),
        total: config.max,
      };
    }

    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = store.get(key);

    if (!entry || now - entry.windowStart >= config.windowMs) {
      // New window
      entry = { timestamps: [now], windowStart: now };
      store.set(key, entry);
    } else {
      // Existing window — remove expired timestamps
      const validTimestamps = entry.timestamps.filter((t) => t > windowStart);
      validTimestamps.push(now);
      entry = { timestamps: validTimestamps, windowStart: entry.windowStart };
      store.set(key, entry);
    }

    const remaining = Math.max(0, config.max - entry.timestamps.length);
    const allowed = entry.timestamps.length <= config.max;

    return {
      allowed,
      remaining,
      resetAt: new Date(entry.windowStart + config.windowMs),
      total: config.max,
    };
  }

  /**
   * Middleware-like function that checks and optionally handles rate limiting.
   */
  function middleware(
    request: RateLimitRequest,
    response?: {
      statusCode: number;
      headers: Record<string, string>;
      body?: string;
    },
  ): RateLimitResult {
    const result = check(request);

    if (!result.allowed && response && handler) {
      handler(request, response);
    }

    return result;
  }

  /**
   * Resets the rate limit for a specific key.
   */
  function reset(key: string): void {
    store.delete(key);
  }

  /**
   * Clears all rate limit data.
   */
  function clear(): void {
    store.clear();
  }

  /**
   * Gets the current count for a key.
   */
  function getCount(key: string): number {
    const entry = store.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const windowStart = now - config.windowMs;
    return entry.timestamps.filter((t) => t > windowStart).length;
  }

  /**
   * Destroys the rate limiter and cleans up resources.
   */
  function destroy(): void {
    clearInterval(cleanupInterval);
    store.clear();
  }

  return {
    check,
    middleware,
    reset,
    clear,
    getCount,
    destroy,
  };
}

/**
 * Extracts the client IP from request headers.
 * Used as a default key generator.
 *
 * @param headers - Request headers.
 * @returns The client IP address.
 */
export function extractClientIp(
  headers: Record<string, string | string[] | undefined>,
): string {
  // X-Forwarded-For (first entry)
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    const first = forwarded[0]?.split(",")[0]?.trim();
    if (first) return first;
  }

  // X-Real-IP
  const realIp = headers["x-real-ip"];
  if (typeof realIp === "string") return realIp;

  return "unknown";
}
