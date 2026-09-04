/**
 * @zudojs/observability — Observability Core
 *
 * Central facade that coordinates logging, metrics, tracing, and context
 * propagation. Other Zudojs packages depend on this abstraction rather
 * than on specific telemetry implementations.
 */

import type {
  Logger,
  MetricsRegistry,
  Observability,
  ObservabilityConfig,
  PropagationManager,
  Tracer,
} from "../types.js";
import { LogLevel } from "../types.js";
import { StructuredLogger } from "../logger/index.js";
import { DefaultMetricsRegistry } from "../metrics/index.js";
import { DefaultTracer } from "../tracing/index.js";
import { AsyncPropagationManager } from "../propagation/index.js";
import {
  ConsoleLogExporter,
  ConsoleSpanExporter,
  ConsoleMetricExporter,
} from "../exporter/index.js";
import { BatchSpanProcessor } from "../processor/index.js";

/**
 * Default observability implementation.
 *
 * Provides a unified API for logging, metrics, tracing, and context propagation.
 * Use this as the single entry point for all telemetry in a Zudojs application.
 */
export class DefaultObservability implements Observability {
  readonly logger: Logger;
  readonly metrics: MetricsRegistry;
  readonly tracer: Tracer;
  readonly propagation: PropagationManager;
  private readonly resourceAttributes: Record<string, unknown>;
  private readonly shutdownHooks: Array<() => Promise<void>> = [];

  constructor(config: ObservabilityConfig) {
    this.resourceAttributes = {
      "service.name": config.serviceName,
      ...(config.serviceVersion
        ? { "service.version": config.serviceVersion }
        : {}),
      ...(config.environment
        ? { "deployment.environment": config.environment }
        : {}),
      ...(config.resource ?? {}),
    };

    // Logger — uses console by default, or the provided exporter
    const logExporter = config.logExporter ?? new ConsoleLogExporter();
    this.logger = new StructuredLogger({
      name: config.serviceName,
      level: config.logLevel ?? LogLevel.INFO,
      transport: {
        name: "observability",
        write: (record) => {
          void logExporter.export([record]);
        },
      },
    });

    // Metrics
    this.metrics = new DefaultMetricsRegistry();

    // Tracing
    const spanExporter = config.spanExporter ?? new ConsoleSpanExporter();
    const processor = new BatchSpanProcessor({ exporter: spanExporter });
    this.tracer = new DefaultTracer({
      processors: config.processors ?? [processor],
      exporter: spanExporter,
      resource: this.resourceAttributes,
    });

    // Propagation
    this.propagation = new AsyncPropagationManager();

    // Register shutdown hooks
    this.shutdownHooks.push(async () => {
      await processor.shutdown();
      await spanExporter.shutdown();
      await logExporter.shutdown();
    });
  }

  resource(attributes: Record<string, unknown>): Observability {
    const child = new DefaultObservability({
      serviceName:
        (this.resourceAttributes["service.name"] as string) ?? "unknown",
      resource: { ...this.resourceAttributes, ...attributes },
    });
    return child;
  }

  async shutdown(): Promise<void> {
    for (const hook of this.shutdownHooks) {
      await hook();
    }
    if (this.tracer instanceof DefaultTracer) {
      await this.tracer.shutdown();
    }
  }
}

/** Creates an observability instance. */
export function createObservability(
  config: ObservabilityConfig,
): DefaultObservability {
  return new DefaultObservability(config);
}
