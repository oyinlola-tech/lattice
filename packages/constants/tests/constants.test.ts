import { describe, it, expect } from "vitest";
import {
  // HTTP
  type HttpMethod,
  HttpMethods,
  HTTP_METHODS,
  SAFE_HTTP_METHODS,
  IDEMPOTENT_HTTP_METHODS,
  type HttpStatusCode,
  HttpStatus,
  isSuccessStatus,
  isRedirectStatus,
  isClientError,
  isServerError,
  isErrorStatus,
  type HttpHeaderName,
  HttpHeader,
  type ContentType,
  ContentTypes,
  Charset,
  buildContentType,

  // Environment
  type Environment,
  Environments,
  ENVIRONMENTS,
  isValidEnvironment,
  NODE_ENV_KEY,
  resolveEnvironment,
  isProduction,
  isDevelopment,
  isTest,

  // Time
  type TimeUnit,
  TimeUnits,
  TimeMs,
  DefaultTimeout,
  DefaultRetry,
  toMilliseconds,
  formatDuration,

  // Common
  Limits,
  Defaults,
  Sentinel,
  NONE,
  UNINITIALIZED,
  EMPTY,
  createUserId,
  createEventId,
  createRequestId,
  createCorrelationId,
  createTimestamp,

  // Validation
  ValidationPattern,
  ValidationLength,
  ValidationRange,

  // Cache
  type CacheStrategy,
  CacheStrategies,
  CacheDuration,
  buildCacheControl,

  // Priority
  type Priority,
  Priorities,
  PriorityWeight,
  comparePriority,

  // Errors
  InvalidConstantError,
  ConstantContextError,
} from "../src/index.js";

// ─── HTTP ───────────────────────────────────────────────────────────────────

describe("HttpMethods", () => {
  it("should contain all standard HTTP methods", () => {
    expect(HttpMethods.GET).toBe("GET");
    expect(HttpMethods.POST).toBe("POST");
    expect(HttpMethods.PUT).toBe("PUT");
    expect(HttpMethods.PATCH).toBe("PATCH");
    expect(HttpMethods.DELETE).toBe("DELETE");
    expect(HttpMethods.HEAD).toBe("HEAD");
    expect(HttpMethods.OPTIONS).toBe("OPTIONS");
    expect(HttpMethods.TRACE).toBe("TRACE");
    expect(HttpMethods.CONNECT).toBe("CONNECT");
  });

  it("should have 9 methods in HTTP_METHODS set", () => {
    expect(HTTP_METHODS.size).toBe(9);
  });

  it("should identify safe methods", () => {
    expect(SAFE_HTTP_METHODS.has("GET")).toBe(true);
    expect(SAFE_HTTP_METHODS.has("HEAD")).toBe(true);
    expect(SAFE_HTTP_METHODS.has("OPTIONS")).toBe(true);
    expect(SAFE_HTTP_METHODS.has("POST")).toBe(false);
  });

  it("should identify idempotent methods", () => {
    expect(IDEMPOTENT_HTTP_METHODS.has("GET")).toBe(true);
    expect(IDEMPOTENT_HTTP_METHODS.has("PUT")).toBe(true);
    expect(IDEMPOTENT_HTTP_METHODS.has("DELETE")).toBe(true);
    expect(IDEMPOTENT_HTTP_METHODS.has("POST")).toBe(false);
  });
});

describe("HttpStatus", () => {
  it("should contain all standard status codes", () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.CREATED).toBe(201);
    expect(HttpStatus.NO_CONTENT).toBe(204);
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it("isSuccessStatus should work", () => {
    expect(isSuccessStatus(200)).toBe(true);
    expect(isSuccessStatus(299)).toBe(true);
    expect(isSuccessStatus(300)).toBe(false);
    expect(isSuccessStatus(199)).toBe(false);
  });

  it("isRedirectStatus should work", () => {
    expect(isRedirectStatus(301)).toBe(true);
    expect(isRedirectStatus(399)).toBe(true);
    expect(isRedirectStatus(400)).toBe(false);
  });

  it("isClientError should work", () => {
    expect(isClientError(400)).toBe(true);
    expect(isClientError(499)).toBe(true);
    expect(isClientError(500)).toBe(false);
  });

  it("isServerError should work", () => {
    expect(isServerError(500)).toBe(true);
    expect(isServerError(599)).toBe(true);
    expect(isServerError(499)).toBe(false);
  });

  it("isErrorStatus should work", () => {
    expect(isErrorStatus(400)).toBe(true);
    expect(isErrorStatus(500)).toBe(true);
    expect(isErrorStatus(200)).toBe(false);
  });
});

describe("HttpHeader", () => {
  it("should contain common headers", () => {
    expect(HttpHeader.CONTENT_TYPE).toBe("Content-Type");
    expect(HttpHeader.AUTHORIZATION).toBe("Authorization");
    expect(HttpHeader.ACCEPT).toBe("Accept");
    expect(HttpHeader.X_REQUEST_ID).toBe("X-Request-Id");
  });
});

describe("ContentTypes", () => {
  it("should contain common MIME types", () => {
    expect(ContentTypes.JSON).toBe("application/json");
    expect(ContentTypes.TEXT_PLAIN).toBe("text/plain");
    expect(ContentTypes.IMAGE_PNG).toBe("image/png");
  });

  it("buildContentType should work", () => {
    expect(buildContentType("application/json")).toBe("application/json");
    expect(buildContentType("application/json", "utf-8")).toBe(
      "application/json; charset=utf-8",
    );
  });
});

// ─── Environment ────────────────────────────────────────────────────────────

describe("Environments", () => {
  it("should contain all environments", () => {
    expect(Environments.DEVELOPMENT).toBe("development");
    expect(Environments.TEST).toBe("test");
    expect(Environments.STAGING).toBe("staging");
    expect(Environments.PRODUCTION).toBe("production");
  });

  it("should have 4 environments", () => {
    expect(ENVIRONMENTS.size).toBe(4);
  });
});

describe("isValidEnvironment", () => {
  it("should accept valid environments", () => {
    expect(isValidEnvironment("development")).toBe(true);
    expect(isValidEnvironment("production")).toBe(true);
    expect(isValidEnvironment("test")).toBe(true);
    expect(isValidEnvironment("staging")).toBe(true);
  });

  it("should reject invalid environments", () => {
    expect(isValidEnvironment("dev")).toBe(false);
    expect(isValidEnvironment("prod")).toBe(false);
    expect(isValidEnvironment("")).toBe(false);
  });
});

describe("resolveEnvironment", () => {
  it("should default to development", () => {
    expect(resolveEnvironment({})).toBe("development");
  });

  it("should resolve from NODE_ENV", () => {
    expect(resolveEnvironment({ NODE_ENV: "production" })).toBe("production");
    expect(resolveEnvironment({ NODE_ENV: "test" })).toBe("test");
    expect(resolveEnvironment({ NODE_ENV: "staging" })).toBe("staging");
  });

  it("should normalise abbreviations", () => {
    expect(resolveEnvironment({ NODE_ENV: "prod" })).toBe("production");
    expect(resolveEnvironment({ NODE_ENV: "dev" })).toBe("development");
  });

  it("should handle case insensitivity", () => {
    expect(resolveEnvironment({ NODE_ENV: "PRODUCTION" })).toBe("production");
    expect(resolveEnvironment({ NODE_ENV: "Development" })).toBe("development");
  });
});

describe("isProduction / isDevelopment / isTest", () => {
  it("should detect production", () => {
    expect(isProduction({ NODE_ENV: "production" })).toBe(true);
    expect(isProduction({ NODE_ENV: "development" })).toBe(false);
  });

  it("should detect development", () => {
    expect(isDevelopment({ NODE_ENV: "development" })).toBe(true);
    expect(isDevelopment({ NODE_ENV: "production" })).toBe(false);
  });

  it("should detect test", () => {
    expect(isTest({ NODE_ENV: "test" })).toBe(true);
    expect(isTest({ NODE_ENV: "development" })).toBe(false);
  });
});

// ─── Time ───────────────────────────────────────────────────────────────────

describe("TimeUnits", () => {
  it("should contain all time units", () => {
    expect(TimeUnits.MILLISECONDS).toBe("milliseconds");
    expect(TimeUnits.SECONDS).toBe("seconds");
    expect(TimeUnits.MINUTES).toBe("minutes");
    expect(TimeUnits.HOURS).toBe("hours");
    expect(TimeUnits.DAYS).toBe("days");
  });
});

describe("TimeMs", () => {
  it("should have correct durations", () => {
    expect(TimeMs.MILLISECOND).toBe(1);
    expect(TimeMs.SECOND).toBe(1_000);
    expect(TimeMs.MINUTE).toBe(60_000);
    expect(TimeMs.HOUR).toBe(3_600_000);
    expect(TimeMs.DAY).toBe(86_400_000);
  });
});

describe("DefaultTimeout", () => {
  it("should have reasonable defaults", () => {
    expect(DefaultTimeout.FAST).toBeLessThan(DefaultTimeout.STANDARD);
    expect(DefaultTimeout.STANDARD).toBeLessThan(DefaultTimeout.SLOW);
    expect(DefaultTimeout.DATABASE).toBeGreaterThan(0);
  });
});

describe("DefaultRetry", () => {
  it("should have reasonable defaults", () => {
    expect(DefaultRetry.MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(DefaultRetry.BASE_DELAY_MS).toBeGreaterThan(0);
    expect(DefaultRetry.BACKOFF_MULTIPLIER).toBeGreaterThan(1);
  });
});

describe("toMilliseconds", () => {
  it("should convert from milliseconds", () => {
    expect(toMilliseconds(5, "milliseconds")).toBe(5);
  });

  it("should convert from seconds", () => {
    expect(toMilliseconds(2, "seconds")).toBe(2_000);
  });

  it("should convert from minutes", () => {
    expect(toMilliseconds(1, "minutes")).toBe(60_000);
  });

  it("should convert from hours", () => {
    expect(toMilliseconds(1, "hours")).toBe(3_600_000);
  });

  it("should convert from days", () => {
    expect(toMilliseconds(1, "days")).toBe(86_400_000);
  });
});

describe("formatDuration", () => {
  it("should format milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
  });

  it("should format seconds", () => {
    expect(formatDuration(5_000)).toBe("5s");
  });

  it("should format minutes", () => {
    expect(formatDuration(90_000)).toBe("90s");
  });

  it("should format hours", () => {
    expect(formatDuration(3_600_000)).toBe("1h");
  });

  it("should format hours with minutes", () => {
    expect(formatDuration(5_400_000)).toBe("1h 30m");
  });

  it("should format days", () => {
    expect(formatDuration(86_400_000)).toBe("1d");
  });

  it("should format days with hours", () => {
    expect(formatDuration(90_000_000)).toBe("1d 1h");
  });
});

// ─── Common ─────────────────────────────────────────────────────────────────

describe("Limits", () => {
  it("should have reasonable limits", () => {
    expect(Limits.MAX_DISPLAY_LENGTH).toBe(255);
    expect(Limits.MAX_PAGE_SIZE).toBe(100);
    expect(Limits.DEFAULT_PAGE_SIZE).toBe(20);
    expect(Limits.MAX_FILE_SIZE).toBeGreaterThan(0);
  });
});

describe("Defaults", () => {
  it("should have standard defaults", () => {
    expect(Defaults.ENCODING).toBe("utf-8");
    expect(Defaults.CONTENT_TYPE).toBe("application/json");
    expect(Defaults.TIMEZONE).toBe("UTC");
    expect(Defaults.PORT).toBe(3000);
  });
});

describe("Sentinel", () => {
  it("should have sentinel values", () => {
    expect(Sentinel.NULL).toBeNull();
    expect(Sentinel.DELETED).toBe("__DELETED__");
    expect(Sentinel.WILDCARD).toBe("*");
  });
});

describe("Sentinels", () => {
  it("NONE should be NONE", () => {
    expect(NONE).toBe("NONE");
  });

  it("UNINITIALIZED should be UNINITIALIZED", () => {
    expect(UNINITIALIZED).toBe("UNINITIALIZED");
  });

  it("EMPTY should be empty string", () => {
    expect(EMPTY).toBe("");
  });
});

describe("Branded type factories", () => {
  it("createUserId should return branded string", () => {
    const id = createUserId("user-123");
    expect(id).toBe("user-123");
  });

  it("createEventId should return branded string", () => {
    const id = createEventId("evt-456");
    expect(id).toBe("evt-456");
  });

  it("createRequestId should return branded string", () => {
    const id = createRequestId("req-789");
    expect(id).toBe("req-789");
  });

  it("createCorrelationId should return branded string", () => {
    const id = createCorrelationId("corr-abc");
    expect(id).toBe("corr-abc");
  });

  it("createTimestamp should return branded string", () => {
    const ts = createTimestamp("2024-01-01T00:00:00.000Z");
    expect(ts).toBe("2024-01-01T00:00:00.000Z");
  });
});

// ─── Validation ─────────────────────────────────────────────────────────────

describe("ValidationPattern", () => {
  it("should match valid emails", () => {
    expect(ValidationPattern.EMAIL.test("user@example.com")).toBe(true);
    expect(ValidationPattern.EMAIL.test("test.name+tag@domain.co")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(ValidationPattern.EMAIL.test("not-an-email")).toBe(false);
    expect(ValidationPattern.EMAIL.test("@example.com")).toBe(false);
  });

  it("should match valid UUIDs", () => {
    expect(
      ValidationPattern.UUID.test("550e8400-e29b-41d4-a716-446655440000"),
    ).toBe(true);
  });

  it("should reject invalid UUIDs", () => {
    expect(ValidationPattern.UUID.test("not-a-uuid")).toBe(false);
    expect(ValidationPattern.UUID.test("550e8400-e29b-41d4-a716")).toBe(false);
  });

  it("should match valid semver", () => {
    expect(ValidationPattern.SEMVER.test("1.0.0")).toBe(true);
    expect(ValidationPattern.SEMVER.test("2.1.3-beta.1")).toBe(true);
  });

  it("should match valid slugs", () => {
    expect(ValidationPattern.SLUG.test("hello-world")).toBe(true);
    expect(ValidationPattern.SLUG.test("my-cool-feature")).toBe(true);
  });
});

describe("ValidationLength", () => {
  it("should have reasonable lengths", () => {
    expect(ValidationLength.SHORT).toBe(64);
    expect(ValidationLength.NAME).toBe(128);
    expect(ValidationLength.EMAIL).toBe(255);
    expect(ValidationLength.URL).toBe(2_048);
  });
});

describe("ValidationRange", () => {
  it("should have reasonable ranges", () => {
    expect(ValidationRange.MIN_PORT).toBe(1);
    expect(ValidationRange.MAX_PORT).toBe(65_535);
    expect(ValidationRange.MAX_PAGE_SIZE).toBe(100);
  });
});

// ─── Cache ──────────────────────────────────────────────────────────────────

describe("CacheStrategies", () => {
  it("should contain all strategies", () => {
    expect(CacheStrategies.NO_STORE).toBe("no-store");
    expect(CacheStrategies.NO_CACHE).toBe("no-cache");
    expect(CacheStrategies.PRIVATE).toBe("private");
    expect(CacheStrategies.PUBLIC).toBe("public");
    expect(CacheStrategies.MUST_REVALIDATE).toBe("must-revalidate");
    expect(CacheStrategies.IMMUTABLE).toBe("immutable");
  });
});

describe("CacheDuration", () => {
  it("should have correct durations", () => {
    expect(CacheDuration.NONE).toBe(0);
    expect(CacheDuration.SHORT).toBe(10);
    expect(CacheDuration.MEDIUM).toBe(300);
    expect(CacheDuration.LONG).toBe(3_600);
  });
});

describe("buildCacheControl", () => {
  it("should build a simple cache control header", () => {
    const result = buildCacheControl({ strategy: "public", maxAge: 3600 });
    expect(result).toBe("public, max-age=3600");
  });

  it("should include stale-while-revalidate", () => {
    const result = buildCacheControl({
      strategy: "public",
      maxAge: 300,
      staleWhileRevalidate: 60,
    });
    expect(result).toBe("public, max-age=300, stale-while-revalidate=60");
  });

  it("should include s-maxage", () => {
    const result = buildCacheControl({
      strategy: "public",
      maxAge: 300,
      sharedMaxAge: 600,
    });
    expect(result).toBe("public, max-age=300, s-maxage=600");
  });

  it("should handle strategy only", () => {
    const result = buildCacheControl({ strategy: "no-store" });
    expect(result).toBe("no-store");
  });
});

// ─── Priority ───────────────────────────────────────────────────────────────

describe("Priorities", () => {
  it("should contain all priority levels", () => {
    expect(Priorities.CRITICAL).toBe("critical");
    expect(Priorities.HIGH).toBe("high");
    expect(Priorities.NORMAL).toBe("normal");
    expect(Priorities.LOW).toBe("low");
    expect(Priorities.BACKGROUND).toBe("background");
  });
});

describe("PriorityWeight", () => {
  it("should have correct weights", () => {
    expect(PriorityWeight.critical).toBe(100);
    expect(PriorityWeight.high).toBe(75);
    expect(PriorityWeight.normal).toBe(50);
    expect(PriorityWeight.low).toBe(25);
    expect(PriorityWeight.background).toBe(10);
  });
});

describe("comparePriority", () => {
  it("should rank critical above high", () => {
    expect(comparePriority("critical", "high")).toBeLessThan(0);
  });

  it("should rank high above normal", () => {
    expect(comparePriority("high", "normal")).toBeLessThan(0);
  });

  it("should return 0 for equal priorities", () => {
    expect(comparePriority("normal", "normal")).toBe(0);
  });

  it("should rank low below normal", () => {
    expect(comparePriority("low", "normal")).toBeGreaterThan(0);
  });
});

// ─── Errors ─────────────────────────────────────────────────────────────────

describe("InvalidConstantError", () => {
  it("should create an error with message", () => {
    const error = new InvalidConstantError("Invalid value provided");
    expect(error.message).toBe("Invalid value provided");
    expect(error.name).toBe("InvalidConstantError");
  });

  it("should be instance of Error", () => {
    const error = new InvalidConstantError("test");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("ConstantContextError", () => {
  it("should create an error with message", () => {
    const error = new ConstantContextError("Wrong context");
    expect(error.message).toBe("Wrong context");
    expect(error.name).toBe("ConstantContextError");
  });

  it("should be instance of Error", () => {
    const error = new ConstantContextError("test");
    expect(error).toBeInstanceOf(Error);
  });
});
