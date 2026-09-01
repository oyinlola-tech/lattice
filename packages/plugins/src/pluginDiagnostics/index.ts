/**
 * @oyinlola141/lattice-plugins/pluginDiagnostics
 *
 * Plugin health checks and diagnostic reporting.
 */

export type { PluginHealthStatus, PluginHealth, PluginDiagnostic, PluginDiagnosticReport } from "./pluginDiagnostic.core.js";
export { createHealthyHealth, createDegradedHealth, createUnhealthyHealth, buildDiagnosticReport } from "./pluginDiagnostic.core.js";
