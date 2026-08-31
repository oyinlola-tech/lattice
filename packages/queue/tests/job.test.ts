import { describe, it, expect } from "vitest";

import {
  createJob,
  isJob,
  updateJobState,
  incrementJobAttempt,
} from "../src/job/job.core.js";

import {
  createJobId,
  createJobName,
  createQueueName,
  JobState,
} from "../src/jobTypes/jobTypes.type.js";

describe("Job", () => {
  describe("createJob", () => {
    it("should create a job with default options", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
      });

      expect(job.id).toBeDefined();
      expect(job.name).toBe("test-job");
      expect(job.queueName).toBe("test-queue");
      expect(job.data).toEqual({ userId: "123" });
      expect(job.state).toBe(JobState.WAITING);
      expect(job.attempt).toBe(0);
      expect(job.maxAttempts).toBe(1);
      expect(job.priority).toBe(50);
      expect(job.createdAt).toBeDefined();
      expect(job.updatedAt).toBeDefined();
    });

    it("should create a job with custom options", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
        options: {
          attempts: 3,
          priority: 100,
          timeout: 60_000,
        },
      });

      expect(job.maxAttempts).toBe(3);
      expect(job.priority).toBe(100);
      expect(job.timeoutMs).toBe(60_000);
    });

    it("should create a scheduled job when delay is provided", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
        options: {
          delay: 10_000,
        },
      });

      expect(job.state).toBe(JobState.SCHEDULED);
    });

    it("should create a job with a custom ID", () => {
      const customId = createJobId("custom-id");
      const job = createJob(
        {
          name: createJobName("test-job"),
          queueName: createQueueName("test-queue"),
          data: { userId: "123" },
        },
        customId,
      );

      expect(job.id).toBe("custom-id");
    });
  });

  describe("isJob", () => {
    it("should return true for a valid Job", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
      });

      expect(isJob(job)).toBe(true);
    });

    it("should return false for a non-Job object", () => {
      expect(isJob({})).toBe(false);
      expect(isJob(null)).toBe(false);
      expect(isJob(undefined)).toBe(false);
      expect(isJob("string")).toBe(false);
    });
  });

  describe("updateJobState", () => {
    it("should update job state", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
      });

      const updatedJob = updateJobState(job, JobState.ACTIVE);

      expect(updatedJob.state).toBe(JobState.ACTIVE);
      expect(updatedJob.updatedAt).toBeDefined();
    });

    it("should update job state with additional fields", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
      });

      const updatedJob = updateJobState(job, JobState.FAILED, {
        error: "Test error",
      });

      expect(updatedJob.state).toBe(JobState.FAILED);
      expect(updatedJob.error).toBe("Test error");
    });
  });

  describe("incrementJobAttempt", () => {
    it("should increment job attempt", () => {
      const job = createJob({
        name: createJobName("test-job"),
        queueName: createQueueName("test-queue"),
        data: { userId: "123" },
      });

      expect(job.attempt).toBe(0);

      const updatedJob = incrementJobAttempt(job);
      expect(updatedJob.attempt).toBe(1);

      const updatedJob2 = incrementJobAttempt(updatedJob);
      expect(updatedJob2.attempt).toBe(2);
    });
  });
});
