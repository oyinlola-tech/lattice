import { describe, it, expect } from "vitest";
import {
  // Core
  compose,
  resolveMiddleware,
  withTiming,

  // Pipeline
  createPipeline,

  // Built-in middleware
  loggingMiddleware,
  errorMiddleware,
  timeoutMiddleware,
  rateLimitMiddleware,

  // Errors
  MiddlewareError,
  MiddlewareTimeoutError,
  MiddlewareNextCalledMultipleTimesError,
} from "../src/index.js";
import type { Middleware, NamedMiddleware } from "../src/index.js";

// ─── Compose ───────────────────────────────────────────────────────────────

describe("compose", () => {
  it("should call handler directly when no middleware", async () => {
    const handler = async () => "result";
    const composed = compose([], handler);
    expect(await composed({})).toBe("result");
  });

  it("should execute middleware in order", async () => {
    const order: string[] = [];
    const mw1: Middleware<string> = async (ctx, next) => {
      order.push("mw1-before");
      await next();
      order.push("mw1-after");
    };
    const mw2: Middleware<string> = async (ctx, next) => {
      order.push("mw2-before");
      await next();
      order.push("mw2-after");
    };
    const handler = async () => {
      order.push("handler");
      return "done";
    };

    const composed = compose([mw1, mw2], handler);
    await composed("test");
    expect(order).toEqual([
      "mw1-before",
      "mw2-before",
      "handler",
      "mw2-after",
      "mw1-after",
    ]);
  });

  it("should catch errors in middleware", async () => {
    const mw: Middleware<string> = async (ctx, next) => {
      throw new Error("middleware error");
    };
    const handler = async () => "result";
    const composed = compose([mw], handler);
    await expect(composed("test")).rejects.toThrow("middleware error");
  });

  it("should detect next() called multiple times", async () => {
    const mw: Middleware<string> = async (ctx, next) => {
      await next();
      await next();
    };
    const handler = async () => "result";
    const composed = compose([mw], handler);
    await expect(composed("test")).rejects.toThrow(
      "next() called multiple times",
    );
  });
});

// ─── Named Middleware ──────────────────────────────────────────────────────

describe("NamedMiddleware", () => {
  it("should sort by priority", () => {
    const list: NamedMiddleware<string>[] = [
      { name: "low", handler: async (c, n) => n(), priority: 200 },
      { name: "high", handler: async (c, n) => n(), priority: 10 },
      { name: "default", handler: async (c, n) => n() },
    ];
    const resolved = resolveMiddleware(list);
    expect(resolved.length).toBe(3);
  });

  it("should filter disabled middleware", () => {
    const list: NamedMiddleware<string>[] = [
      { name: "enabled", handler: async (c, n) => n() },
      { name: "disabled", handler: async (c, n) => n(), enabled: false },
    ];
    const resolved = resolveMiddleware(list);
    expect(resolved.length).toBe(1);
  });
});

// ─── Pipeline ──────────────────────────────────────────────────────────────

describe("createPipeline", () => {
  it("should execute middleware and handler", async () => {
    const mw: NamedMiddleware<string> = {
      name: "test",
      handler: async (ctx, next) => next(),
    };
    const pipeline = createPipeline([mw], async (ctx) => `result: ${ctx}`);
    const result = await pipeline("hello");
    expect(result.success).toBe(true);
    expect(result.result).toBe("result: hello");
    expect(result.executedMiddleware).toEqual(["test"]);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("should track errors", async () => {
    const mw: NamedMiddleware<string> = {
      name: "failing",
      handler: async (ctx, next) => {
        throw new Error("boom");
      },
    };
    const pipeline = createPipeline([mw], async () => "ok");
    const result = await pipeline("test");
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("should respect maxMiddleware", () => {
    const mws: NamedMiddleware<string>[] = Array.from(
      { length: 10 },
      (_, i) => ({
        name: `mw-${i}`,
        handler: async (c, n) => n(),
      }),
    );
    expect(() =>
      createPipeline(mws, async () => "ok", { maxMiddleware: 5 }),
    ).toThrow();
  });
});

// ─── Built-in Middleware ───────────────────────────────────────────────────

describe("loggingMiddleware", () => {
  it("should log before and after", async () => {
    const logs: string[] = [];
    const mw = loggingMiddleware((msg) => logs.push(msg));
    const pipeline = createPipeline([mw], async () => "ok");
    await pipeline({ method: "GET", path: "/test" });
    expect(logs.length).toBe(2);
    expect(logs[0]).toContain("GET /test");
    expect(logs[1]).toContain("completed");
  });
});

describe("errorMiddleware", () => {
  it("should catch and report errors", async () => {
    let caughtError: unknown = null;
    const mw = errorMiddleware((err) => {
      caughtError = err;
    });
    const pipeline = createPipeline([mw], async () => {
      throw new Error("test error");
    });
    const result = await pipeline({});
    expect(result.success).toBe(false);
    expect(caughtError).toBeInstanceOf(Error);
  });
});

describe("timeoutMiddleware", () => {
  it("should allow fast operations", async () => {
    const mw = timeoutMiddleware<unknown>(1000);
    const pipeline = createPipeline([mw], async () => "fast");
    const result = await pipeline({});
    expect(result.success).toBe(true);
  });

  it("should timeout slow operations", async () => {
    const mw = timeoutMiddleware<unknown>(50);
    const pipeline = createPipeline([mw], async () => {
      await new Promise((r) => setTimeout(r, 200));
      return "slow";
    });
    const result = await pipeline({});
    expect(result.success).toBe(false);
  });
});

describe("rateLimitMiddleware", () => {
  it("should allow requests within limit", async () => {
    const mw = rateLimitMiddleware<{ key?: string }>(5, 1000);
    const pipeline = createPipeline([mw], async () => "ok");
    for (let i = 0; i < 5; i++) {
      const result = await pipeline({ key: "user-1" });
      expect(result.success).toBe(true);
    }
  });

  it("should reject requests over limit", async () => {
    const mw = rateLimitMiddleware<{ key?: string }>(2, 1000);
    const pipeline = createPipeline([mw], async () => "ok");
    await pipeline({ key: "user-1" });
    await pipeline({ key: "user-1" });
    const result = await pipeline({ key: "user-1" });
    expect(result.success).toBe(false);
  });
});

// ─── withTiming ────────────────────────────────────────────────────────────

describe("withTiming", () => {
  it("should wrap middleware with timing info", async () => {
    const inner: Middleware<string> = async (ctx, next) => next();
    const timed = withTiming("timed-mw", inner);
    expect(timed.name).toBe("timed-mw");
    const pipeline = createPipeline([timed], async () => "ok");
    const result = await pipeline("test");
    expect(result.success).toBe(true);
  });
});

// ─── Errors ────────────────────────────────────────────────────────────────

describe("MiddlewareError", () => {
  it("should create an error with message", () => {
    const error = new MiddlewareError("test error", { middlewareName: "test" });
    expect(error.message).toBe("test error");
    expect(error.name).toBe("MiddlewareError");
  });
});

describe("MiddlewareTimeoutError", () => {
  it("should create a timeout error", () => {
    const error = new MiddlewareTimeoutError("slow-mw", 5000);
    expect(error.message).toContain("slow-mw");
    expect(error.message).toContain("5000");
  });
});

describe("MiddlewareNextCalledMultipleTimesError", () => {
  it("should create a next-called error", () => {
    const error = new MiddlewareNextCalledMultipleTimesError("bad-mw");
    expect(error.message).toContain("bad-mw");
    expect(error.message).toContain("next()");
  });
});
