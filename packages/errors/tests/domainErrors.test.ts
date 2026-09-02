import { describe, it, expect } from "vitest";
import { ErrorCode, ErrorSeverity } from "../src/index.js";
import {
  NotFoundError,
  resourceNotFoundError,
  entityNotFoundError,
  routeNotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  TimeoutError,
} from "../src/index.js";

describe("Domain Errors", () => {
  describe("NotFoundError", () => {
    it("sets 404 status code and defaults", () => {
      const err = new NotFoundError("missing");
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(err.isPublic()).toBe(true);
      expect(err.severity).toBe(ErrorSeverity.INFO);
    });

    it("preserves custom options", () => {
      const err = new NotFoundError("missing", { severity: ErrorSeverity.WARNING });
      expect(err.severity).toBe(ErrorSeverity.WARNING);
    });

    it("resourceNotFoundError sets resource metadata", () => {
      const err = resourceNotFoundError("User", "u_123");
      expect(err.statusCode).toBe(404);
      expect(err.getMetadata("resource")).toBe("User");
      expect(err.getMetadata("identifier")).toBe("u_123");
      expect(err.message).toContain("u_123");
    });

    it("entityNotFoundError sets entity metadata", () => {
      const err = entityNotFoundError("Post", 42);
      expect(err.getMetadata("entity")).toBe("Post");
      expect(err.getMetadata("identifier")).toBe("42");
    });

    it("routeNotFoundError includes method and path", () => {
      const err = routeNotFoundError("GET", "/users");
      expect(err.code).toBe(ErrorCode.ROUTE_NOT_FOUND);
      expect(err.getMetadata("method")).toBe("GET");
      expect(err.getMetadata("path")).toBe("/users");
    });
  });

  describe("ValidationError", () => {
    it("sets 400 status code", () => {
      const err = new ValidationError("invalid");
      expect(err.statusCode).toBe(400);
      expect(err.isPublic()).toBe(true);
    });

    it("accepts metadata", () => {
      const err = new ValidationError("invalid", {
        metadata: { field: "email", reason: "must be a string" },
      });
      expect(err.getMetadata("field")).toBe("email");
    });
  });

  describe("AuthenticationError", () => {
    it("sets 401 status code", () => {
      const err = new AuthenticationError("unauthorized");
      expect(err.statusCode).toBe(401);
      expect(err.isPublic()).toBe(true);
    });
  });

  describe("AuthorizationError", () => {
    it("sets 403 status code", () => {
      const err = new AuthorizationError("forbidden");
      expect(err.statusCode).toBe(403);
      expect(err.isPublic()).toBe(true);
    });
  });

  describe("ConflictError", () => {
    it("sets 409 status code", () => {
      const err = new ConflictError("duplicate");
      expect(err.statusCode).toBe(409);
    });
  });

  describe("RateLimitError", () => {
    it("sets 429 status code", () => {
      const err = new RateLimitError("slow down");
      expect(err.statusCode).toBe(429);
    });

    it("preserves retry-after via options", () => {
      const err = new RateLimitError("slow down", { retryAfterSeconds: 60 });
      expect(err.getMetadata("retryAfterSeconds")).toBe(60);
      expect(err.getRetryAfterSeconds()).toBe(60);
      expect(err.getRetryAfterMilliseconds()).toBe(60_000);
    });
  });

  describe("TimeoutError", () => {
    it("returns 504 by default (gateway timeout)", () => {
      const err = new TimeoutError("timed out");
      expect(err.statusCode).toBe(504);
    });

    it("accepts timeoutMs option", () => {
      const err = new TimeoutError("slow", { timeoutMs: 5000 });
      expect(err.getMetadata("timeoutMs")).toBe(5000);
    });

    it("rejects negative timeoutMs", () => {
      expect(() => new TimeoutError("x", { timeoutMs: -1 })).toThrow(RangeError);
    });
  });
});
