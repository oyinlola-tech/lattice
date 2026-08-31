import { describe, it, expect } from "vitest";

import {
  calculateRetryDelay,
  shouldRetry,
  createBackoffOptions,
  createFixedBackoff,
  createExponentialBackoff,
} from "../src/retryPolicy/retryPolicy.core.js";

import { BackoffType } from "../src/jobTypes/jobTypes.type.js";

describe("RetryPolicy", () => {
  describe("calculateRetryDelay", () => {
    it("should return 0 when no backoff is provided", () => {
      const delay = calculateRetryDelay(1);
      expect(delay).toBe(0);
    });

    it("should calculate fixed backoff delay", () => {
      const backoff = createFixedBackoff(1000);
      const delay = calculateRetryDelay(1, backoff);
      expect(delay).toBe(1000);
    });

    it("should calculate exponential backoff delay", () => {
      const backoff = createExponentialBackoff(1000);
      const delay1 = calculateRetryDelay(1, backoff);
      const delay2 = calculateRetryDelay(2, backoff);
      const delay3 = calculateRetryDelay(3, backoff);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it("should respect maxDelay for exponential backoff", () => {
      const backoff = createExponentialBackoff(1000, {
        maxDelay: 5000,
      });

      const delay10 = calculateRetryDelay(10, backoff);
      expect(delay10).toBe(5000);
    });

    it("should use custom multiplier for exponential backoff", () => {
      const backoff = createExponentialBackoff(1000, {
        multiplier: 3,
      });

      const delay2 = calculateRetryDelay(2, backoff);
      expect(delay2).toBe(3000);
    });
  });

  describe("shouldRetry", () => {
    it("should return true when attempt is less than maxAttempts", () => {
      expect(shouldRetry(1, 3)).toBe(true);
      expect(shouldRetry(2, 3)).toBe(true);
    });

    it("should return false when attempt is equal to maxAttempts", () => {
      expect(shouldRetry(3, 3)).toBe(false);
    });

    it("should return false when attempt is greater than maxAttempts", () => {
      expect(shouldRetry(4, 3)).toBe(false);
    });
  });

  describe("createBackoffOptions", () => {
    it("should create fixed backoff options", () => {
      const options = createBackoffOptions(BackoffType.FIXED, 1000);

      expect(options.type).toBe(BackoffType.FIXED);
      expect(options.delay).toBe(1000);
    });

    it("should create exponential backoff options", () => {
      const options = createBackoffOptions(BackoffType.EXPONENTIAL, 1000, {
        maxDelay: 10_000,
        multiplier: 2,
      });

      expect(options.type).toBe(BackoffType.EXPONENTIAL);
      expect(options.delay).toBe(1000);
      expect(options.maxDelay).toBe(10_000);
      expect(options.multiplier).toBe(2);
    });
  });

  describe("createFixedBackoff", () => {
    it("should create a fixed backoff", () => {
      const backoff = createFixedBackoff(1000);

      expect(backoff.type).toBe(BackoffType.FIXED);
      expect(backoff.delay).toBe(1000);
    });
  });

  describe("createExponentialBackoff", () => {
    it("should create an exponential backoff", () => {
      const backoff = createExponentialBackoff(1000);

      expect(backoff.type).toBe(BackoffType.EXPONENTIAL);
      expect(backoff.delay).toBe(1000);
    });

    it("should create an exponential backoff with options", () => {
      const backoff = createExponentialBackoff(1000, {
        maxDelay: 10_000,
        multiplier: 3,
      });

      expect(backoff.type).toBe(BackoffType.EXPONENTIAL);
      expect(backoff.delay).toBe(1000);
      expect(backoff.maxDelay).toBe(10_000);
      expect(backoff.multiplier).toBe(3);
    });
  });
});
