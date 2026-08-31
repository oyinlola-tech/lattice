import { describe, it, expect } from "vitest";

import {
  createJobId,
  createQueueName,
  createJobName,
  isJobId,
  isQueueName,
  isJobName,
  JobState,
  WorkerState,
  BackoffType,
  JobPriorityLevels,
} from "../src/jobTypes/jobTypes.type.js";

describe("JobTypes", () => {
  describe("createJobId", () => {
    it("should create a JobId from a string", () => {
      const id = createJobId("test-id");
      expect(id).toBe("test-id");
    });
  });

  describe("createQueueName", () => {
    it("should create a QueueName from a string", () => {
      const name = createQueueName("test-queue");
      expect(name).toBe("test-queue");
    });
  });

  describe("createJobName", () => {
    it("should create a JobName from a string", () => {
      const name = createJobName("test-job");
      expect(name).toBe("test-job");
    });
  });

  describe("isJobId", () => {
    it("should return true for valid JobId", () => {
      expect(isJobId("test-id")).toBe(true);
    });

    it("should return false for empty string", () => {
      expect(isJobId("")).toBe(false);
    });

    it("should return false for non-string", () => {
      expect(isJobId(123)).toBe(false);
    });
  });

  describe("isQueueName", () => {
    it("should return true for valid QueueName", () => {
      expect(isQueueName("test-queue")).toBe(true);
    });

    it("should return false for empty string", () => {
      expect(isQueueName("")).toBe(false);
    });
  });

  describe("isJobName", () => {
    it("should return true for valid JobName", () => {
      expect(isJobName("test-job")).toBe(true);
    });

    it("should return false for empty string", () => {
      expect(isJobName("")).toBe(false);
    });
  });

  describe("JobState", () => {
    it("should have all expected states", () => {
      expect(JobState.WAITING).toBe("waiting");
      expect(JobState.SCHEDULED).toBe("scheduled");
      expect(JobState.ACTIVE).toBe("active");
      expect(JobState.COMPLETED).toBe("completed");
      expect(JobState.FAILED).toBe("failed");
      expect(JobState.RETRYING).toBe("retrying");
      expect(JobState.CANCELLED).toBe("cancelled");
      expect(JobState.PAUSED).toBe("paused");
      expect(JobState.DEAD_LETTER).toBe("dead_letter");
    });
  });

  describe("WorkerState", () => {
    it("should have all expected states", () => {
      expect(WorkerState.CREATED).toBe("created");
      expect(WorkerState.STARTING).toBe("starting");
      expect(WorkerState.RUNNING).toBe("running");
      expect(WorkerState.DRAINING).toBe("draining");
      expect(WorkerState.STOPPED).toBe("stopped");
      expect(WorkerState.FAILED).toBe("failed");
    });
  });

  describe("BackoffType", () => {
    it("should have all expected types", () => {
      expect(BackoffType.FIXED).toBe("fixed");
      expect(BackoffType.EXPONENTIAL).toBe("exponential");
    });
  });

  describe("JobPriorityLevels", () => {
    it("should have all expected priority levels", () => {
      expect(JobPriorityLevels.LOW).toBe(10);
      expect(JobPriorityLevels.NORMAL).toBe(50);
      expect(JobPriorityLevels.HIGH).toBe(100);
      expect(JobPriorityLevels.CRITICAL).toBe(200);
    });
  });
});
