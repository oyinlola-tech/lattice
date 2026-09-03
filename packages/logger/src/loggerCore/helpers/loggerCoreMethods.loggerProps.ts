/**
 * ZudolibLogger property accessors.
 */

import { LoggerLevel } from "../../loggerLevel/loggerLevel.type.js";

import type { LoggerConfiguration } from "../../loggerOptions/loggerOptions.type.js";

import type { ZudolibLoggerContext } from "../core/loggerCore.core.js";

/**
 * Gets the logger name.
 */
export function getLoggerName(ctx: ZudolibLoggerContext): string {
  ctx.assertActive();
  return ctx.configuration.name;
}

/**
 * Gets the logger level.
 */
export function getLoggerLevel(ctx: ZudolibLoggerContext): LoggerLevel {
  ctx.assertActive();
  return ctx.configuration.level;
}

/**
 * Gets whether the logger is enabled.
 */
export function getLoggerEnabled(ctx: ZudolibLoggerContext): boolean {
  return !ctx.isDisposed() && ctx.configuration.enabled;
}
