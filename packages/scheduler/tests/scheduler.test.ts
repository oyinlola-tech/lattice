import { describe, expect, it } from "vitest";

import { Scheduler } from "../src/scheduler/scheduler.core.js";

import { createJobDefinition } from "../src/scheduler/job/jobDefinition.type.js";

describe("Scheduler", () => {
  it("defines and starts a scheduler", () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("cleanup", "Cleanup sessions", async () => {}),
    );

    expect(() => scheduler.start()).not.toThrow();
    expect(() => scheduler.stop()).not.toThrow();
  });

  it("schedules a job after a delay", () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("cleanup", "Cleanup sessions", async () => {}),
    );

    const handle = scheduler.after("5m", "cleanup");

    expect(handle.id).toBeDefined();
    expect(handle.state).toBe("active");
  });

  it("schedules a job at a specific date", () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("report", "Generate report", async () => {}),
    );

    const future = new Date(Date.now() + 60_000);
    const handle = scheduler.at(future, "report");

    expect(handle.id).toBeDefined();
  });

  it("schedules a job at a fixed interval", () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("heartbeat", "Heartbeat", async () => {}),
    );

    const handle = scheduler.every("10m", "heartbeat");

    expect(handle.id).toBeDefined();
  });

  it("schedules a job with a cron expression", () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("daily", "Daily report", async () => {}),
    );

    const handle = scheduler.cron("0 0 * * *", "daily");

    expect(handle.id).toBeDefined();
  });

  it("throws when scheduling an undefined job", () => {
    const scheduler = new Scheduler();

    expect(() => {
      scheduler.after("5m", "undefined-job");
    }).toThrow();
  });

  it("allows pausing and resuming a schedule", async () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("cleanup", "Cleanup sessions", async () => {}),
    );

    const handle = scheduler.after("5m", "cleanup");

    await handle.pause();
    expect(handle.state).toBe("paused");

    await handle.resume();
    expect(handle.state).toBe("active");
  });

  it("allows cancelling a schedule", async () => {
    const scheduler = new Scheduler();
    scheduler.define(
      createJobDefinition("cleanup", "Cleanup sessions", async () => {}),
    );

    const handle = scheduler.after("5m", "cleanup");

    await handle.cancel();
    expect(handle.state).toBe("cancelled");
  });
});
