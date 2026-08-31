/**
 * @lattice/observability — Console Exporter
 *
 * Exports telemetry to the console for development and debugging.
 */

import type { LogExporter, LogRecord, MetricExporter, MetricSnapshot, ReadableSpan, SpanExporter } from "../types.js";

/**
 * Exports completed spans to the console.
 */
export class ConsoleSpanExporter implements SpanExporter {
  async export(spans: readonly ReadableSpan[]): Promise<void> {
    for (const span of spans) {
      console.log(JSON.stringify({
        type: "span",
        name: span.name,
        traceId: span.context.traceId,
        spanId: span.context.spanId,
        parentSpanId: span.context.parentSpanId,
        kind: span.kind,
        status: span.status,
        duration: `${span.duration}ms`,
        startTime: span.startTime.toISOString(),
        endTime: span.endTime.toISOString(),
        attributes: span.attributes,
        events: span.events,
        resource: span.resource,
      }, null, 2));
    }
  }

  async shutdown(): Promise<void> {
    // No resources to clean up
  }
}

/**
 * Exports log records to the console.
 */
export class ConsoleLogExporter implements LogExporter {
  async export(records: readonly LogRecord[]): Promise<void> {
    for (const record of records) {
      const output = {
        timestamp: record.timestamp.toISOString(),
        level: record.levelName,
        logger: record.loggerName,
        message: record.message,
        ...(record.context ? { context: record.context } : {}),
        ...(record.error ? { error: record.error } : {}),
      };

      if (record.level >= 4) {
        console.error(JSON.stringify(output, null, 2));
      } else if (record.level >= 3) {
        console.warn(JSON.stringify(output, null, 2));
      } else {
        console.log(JSON.stringify(output, null, 2));
      }
    }
  }

  async shutdown(): Promise<void> {
    // No resources to clean up
  }
}

/**
 * Exports metric snapshots to the console.
 */
export class ConsoleMetricExporter implements MetricExporter {
  async export(snapshots: readonly MetricSnapshot[]): Promise<void> {
    for (const snapshot of snapshots) {
      console.log(JSON.stringify({
        type: "metric",
        metricType: snapshot.type,
        name: snapshot.name,
        value: snapshot.value,
        labels: snapshot.labels,
        timestamp: new Date().toISOString(),
      }, null, 2));
    }
  }

  async shutdown(): Promise<void> {
    // No resources to clean up
  }
}

/** Creates a console span exporter. */
export function createConsoleSpanExporter(): ConsoleSpanExporter {
  return new ConsoleSpanExporter();
}

/** Creates a console log exporter. */
export function createConsoleLogExporter(): ConsoleLogExporter {
  return new ConsoleLogExporter();
}

/** Creates a console metric exporter. */
export function createConsoleMetricExporter(): ConsoleMetricExporter {
  return new ConsoleMetricExporter();
}
