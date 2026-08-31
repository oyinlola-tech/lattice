import type { ScheduleType } from "./types/schedulerTypes.core.js";

import type { JobDefinition } from "./job/jobDefinition.type.js";

import type { Schedule } from "./schedule/schedule.type.js";

import type { ScheduleHandle } from "./scheduleHandle/scheduleHandle.type.js";

import type { Trigger } from "./trigger/trigger.type.js";

import type { Clock } from "./clock/schedulerClock.type.js";

import type { ScheduleState } from "./types/schedulerTypes.core.js";

import { ScheduleHandleImpl } from "./scheduleHandle/scheduleHandle.type.js";

import { SchedulerError, SchedulerNotStartedError, SchedulerAlreadyStartedError, SchedulerStoppedError, InvalidScheduleError, InvalidJobError } from "./errors/scheduler.errors.js";

import { DateTrigger, DelayTrigger, IntervalTrigger, CronTrigger } from "./trigger/schedulerTrigger.core.js";

import { SystemClock } from "./clock/schedulerClock.type.js";

import { JobRegistry } from "./registry/jobRegistry.core.js";

import { JobExecutor } from "./executor/jobExecutor.core.js";

import { PriorityQueue } from "./priorityQueue/schedulerPriorityQueue.core.js";

import { parseDuration } from "./duration/duration.parser.js";

import { MAX_SCHEDULES, MAX_TIMER_DELAY } from "./constants/schedulerConstants.core.js";

/**
 * Scheduler for time-based job execution.
 */
export class Scheduler {
  private readonly jobs: JobRegistry;

  private readonly executor: JobExecutor;

  private readonly queue: PriorityQueue;

  private readonly clock: Clock;

  private readonly schedules = new Map<string, Schedule>();

  private running = false;

  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    jobs?: JobRegistry,
    executor?: JobExecutor,
    queue?: PriorityQueue,
    clock?: Clock,
  ) {
    this.jobs = jobs ?? new JobRegistry();
    this.executor = executor ?? new JobExecutor(clock ?? new SystemClock());
    this.queue = queue ?? new PriorityQueue();
    this.clock = clock ?? new SystemClock();
  }

  /**
   * Starts the scheduler.
   */
  start(): void {
    if (this.running) {
      throw new SchedulerAlreadyStartedError();
    }

    this.running = true;
    this.tick();
  }

  /**
   * Stops the scheduler.
   */
  stop(): void {
    if (!this.running) {
      throw new SchedulerStoppedError();
    }

    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Defines a new job.
   */
  define(job: JobDefinition): void {
    this.jobs.register(job);
  }

  /**
   * Schedules a job to run once after a delay.
   */
  after(delay: string, jobId: string): ScheduleHandle {
    const delayMs = parseDuration(delay);
    const trigger = new DelayTrigger(delayMs);
    return this.scheduleJob(jobId, trigger, "delay");
  }

  /**
   * Schedules a job to run at a specific date.
   */
  at(date: Date, jobId: string): ScheduleHandle {
    const trigger = new DateTrigger(date);
    return this.scheduleJob(jobId, trigger, "once");
  }

  /**
   * Schedules a job to run at a fixed interval.
   */
  every(interval: string, jobId: string): ScheduleHandle {
    const intervalMs = parseDuration(interval);
    const trigger = new IntervalTrigger(intervalMs);
    return this.scheduleJob(jobId, trigger, "interval");
  }

  /**
   * Schedules a job using a cron expression.
   */
  cron(expression: string, jobId: string): ScheduleHandle {
    const trigger = new CronTrigger(expression);
    return this.scheduleJob(jobId, trigger, "cron", { expression });
  }

  /**
   * Schedules a job with a trigger.
   */
  private scheduleJob(
    jobId: string,
    trigger: Trigger,
    type: ScheduleType,
    options?: { expression?: string },
  ): ScheduleHandle {
    if (!this.jobs.has(jobId)) {
      throw new InvalidJobError(`Job "${jobId}" is not registered.`, jobId);
    }

    const scheduleId = crypto.randomUUID();
    const nextRunAt = trigger.next(this.clock.now());

    if (nextRunAt === null) {
      throw new InvalidScheduleError("Trigger returned null for next run.", scheduleId);
    }

    const schedule: Schedule = {
      id: scheduleId,
      jobId,
      type,
      expression: options?.expression,
      nextRunAt,
      state: "active",
    };

    this.schedules.set(scheduleId, schedule);
    this.queue.enqueue(schedule);

    return new ScheduleHandleImpl(scheduleId, "active");
  }

  /**
   * Internal tick method for processing due jobs.
   */
  private tick(): void {
    if (!this.running) {
      return;
    }

    const now = this.clock.now();

    while (!this.queue.isEmpty) {
      const schedule = this.queue.peek();

      if (!schedule || schedule.nextRunAt > now) {
        break;
      }

      this.queue.dequeue();

      if (schedule.state !== "active") {
        continue;
      }

      this.executeSchedule(schedule);
    }

    const delay = this.calculateDelay();
    this.timer = setTimeout(() => this.tick(), delay);
  }

  /**
   * Calculates the delay until the next tick.
   */
  private calculateDelay(): number {
    if (this.queue.isEmpty) {
      return MAX_TIMER_DELAY;
    }

    const next = this.queue.peek();
    if (!next) {
      return MAX_TIMER_DELAY;
    }

    const delay = next.nextRunAt.getTime() - this.clock.nowMs();
    return Math.max(0, Math.min(delay, MAX_TIMER_DELAY));
  }

  /**
   * Executes a schedule.
   */
  private async executeSchedule(schedule: Schedule): Promise<void> {
    const job = this.jobs.get(schedule.jobId);
    if (!job) {
      return;
    }

    const executionId = crypto.randomUUID();
    const signal = new AbortController().signal;

    try {
      await this.executor.execute(job, executionId, schedule.nextRunAt, 1, signal);
    } catch (error) {
      // Job execution failed - retry logic would go here
    }
  }
}
