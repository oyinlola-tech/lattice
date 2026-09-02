import { describe, it, expect } from "vitest";
import { ErrorCode, ErrorCategory } from "../src/index.js";

describe("ErrorCode", () => {
  it("should have UNKNOWN code", () => {
    expect(ErrorCode.UNKNOWN).toBe("ERR_UNKNOWN");
  });

  it("should have validation error codes", () => {
    expect(ErrorCode.VALIDATION_FAILED).toBeDefined();
    expect(ErrorCode.SCHEMA_VALIDATION).toBeDefined();
    expect(ErrorCode.API_VALIDATION).toBeDefined();
  });

  it("should have auth error codes", () => {
    expect(ErrorCode.AUTHENTICATION).toBeDefined();
    expect(ErrorCode.AUTHENTICATION_FAILED).toBeDefined();
    expect(ErrorCode.UNAUTHORIZED).toBeDefined();
  });

  it("should have not found error codes", () => {
    expect(ErrorCode.NOT_FOUND).toBeDefined();
    expect(ErrorCode.RESOURCE_NOT_FOUND).toBeDefined();
    expect(ErrorCode.ROUTE_NOT_FOUND).toBeDefined();
  });

  it("should have database error codes", () => {
    expect(ErrorCode.DATABASE).toBeDefined();
    expect(ErrorCode.DATABASE_CONNECTION).toBeDefined();
    expect(ErrorCode.DATABASE_QUERY).toBeDefined();
  });

  it("should have storage error codes", () => {
    expect(ErrorCode.STORAGE).toBeDefined();
    expect(ErrorCode.STORAGE_READ).toBeDefined();
    expect(ErrorCode.STORAGE_WRITE).toBeDefined();
  });
});

describe("ErrorCategory", () => {
  it("should have UNKNOWN category", () => {
    expect(ErrorCategory.UNKNOWN).toBe("unknown");
  });

  it("should have VALIDATION category", () => {
    expect(ErrorCategory.VALIDATION).toBe("validation");
  });

  it("should have AUTHENTICATION category", () => {
    expect(ErrorCategory.AUTHENTICATION).toBe("authentication");
  });

  it("should have DATABASE category", () => {
    expect(ErrorCategory.DATABASE).toBe("database");
  });

  it("should have STORAGE category", () => {
    expect(ErrorCategory.STORAGE).toBe("storage");
  });

  it("should have NETWORK category", () => {
    expect(ErrorCategory.NETWORK).toBe("network");
  });
});
