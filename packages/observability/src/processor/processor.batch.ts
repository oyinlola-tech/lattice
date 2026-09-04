/**
 * @zudojs/observability — Processor
 *
 * Batch span processor that accumulates spans and exports them periodically.
 * Memory-bounded with configurable batch size and flush interval.
 */

import type {
  ReadableSpan,
  Span,
  SpanExporter,
  SpanProcessor,
} from "../types.js";

const DEFAULT_BATCH_SIZE = 512;
const DEFAULT_FLUSH_INTERVAL_MS = 5_000;

/**
 * Collects completed spans and exports them in batches.
 * Flushes on batch size or interval, whichever comes first.
 */
export class BatchSpanProcessor implements SpanProcessor {
  private readonly exporter: SpanExporter;
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private buffer: ReadableSpan[] = [];
  private timer?: ReturnType<typeof setInterval>;
  private shuttingDown = false;

  constructor(options?: {
    readonly exporter?: SpanExporter;
    readonly batchSize?: number;
    readonly flushIntervalMs?: number;
  }) {
    this.exporter = options?.exporter ?? {
      export: async () => {},
      shutdown: async () => {},
    };
    this.batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    this.flushIntervalMs =
      options?.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
  }

  onStart(_span: Span): void {
    // No-op: we only care about completed spans
  }

  onEnd(span: ReadableSpan): void {
    if (this.shuttingDown) return;

    this.buffer.push(span);

    if (this.buffer.length >= this.batchSize) {
      void this.flush();
      return;
    }

    if (!this.timer) {
      this.timer = setInterval(() => {
        void this.flush();
      }, this.flushIntervalMs);

      // Allow the process to exit even if the timer is active
      if (
        this.timer &&
        typeof this.timer === "object" &&
        "unref" in this.timer
      ) {
        this.timer.unref();
      }
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await this.exporter.export(batch);
    } catch {
      // Telemetry failure should not bring down the application
    }
  }

  async shutdown(): Promise<void> {
    this.shuttingDown = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    await this.flush();
  }
}

/** Creates a batch span processor. */
export function createBatchSpanProcessor(options?: {
  readonly exporter?: SpanExporter;
  readonly batchSize?: number;
  readonly flushIntervalMs?: number;
}): BatchSpanProcessor {
  return new BatchSpanProcessor(options);
}
