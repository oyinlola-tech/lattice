import type { Plugin } from "../pluginTypes/plugin.type.js";
import type { PluginMetadata } from "../pluginTypes/pluginMetadata.type.js";
import type { PluginState } from "../pluginTypes/pluginState.type.js";

/**
 * Plugin health status.
 */
export type PluginHealthStatus = "healthy" | "degraded" | "unhealthy";

/**
 * Plugin health information.
 */
export interface PluginHealth {
  readonly status: PluginHealthStatus;

  readonly details?: unknown;
}

/**
 * Individual plugin diagnostic information.
 */
export interface PluginDiagnostic {
  readonly plugin: PluginMetadata;

  readonly state: PluginState;

  readonly health: PluginHealth;

  readonly dependencies: readonly string[];

  readonly optionalDependencies: readonly string[];
}

/**
 * Complete plugin system diagnostic report.
 */
export interface PluginDiagnosticReport {
  readonly plugins: readonly PluginDiagnostic[];

  readonly total: number;

  readonly healthy: number;

  readonly degraded: number;

  readonly unhealthy: number;

  readonly failed: number;
}

/**
 * Creates a default healthy status for a plugin.
 */
export function createHealthyHealth(): PluginHealth {
  return { status: "healthy" };
}

/**
 * Creates a degraded health status for a plugin.
 */
export function createDegradedHealth(details?: unknown): PluginHealth {
  return { status: "degraded", ...(details !== undefined ? { details } : {}) };
}

/**
 * Creates an unhealthy health status for a plugin.
 */
export function createUnhealthyHealth(details?: unknown): PluginHealth {
  return { status: "unhealthy", ...(details !== undefined ? { details } : {}) };
}

/**
 * Builds a diagnostic report from registered plugins.
 */
export function buildDiagnosticReport(
  plugins: Array<{
    readonly plugin: Plugin;
    readonly state: PluginState;
  }>,
): PluginDiagnosticReport {
  const pluginDiagnostics: PluginDiagnostic[] = plugins.map(({ plugin, state }) => ({
    plugin: plugin.metadata,
    state,
    health: state === "started" ? createHealthyHealth() : state === "failed" ? createUnhealthyHealth() : createDegradedHealth(),
    dependencies: plugin.dependencies?.map((d) => d.name) ?? [],
    optionalDependencies: plugin.optionalDependencies?.map((d) => d.name) ?? [],
  }));

  const healthy = pluginDiagnostics.filter((d) => d.health.status === "healthy").length;
  const degraded = pluginDiagnostics.filter((d) => d.health.status === "degraded").length;
  const unhealthy = pluginDiagnostics.filter((d) => d.health.status === "unhealthy").length;
  const failed = pluginDiagnostics.filter((d) => d.state === "failed").length;

  return {
    plugins: Object.freeze(pluginDiagnostics),
    total: pluginDiagnostics.length,
    healthy,
    degraded,
    unhealthy,
    failed,
  };
}
