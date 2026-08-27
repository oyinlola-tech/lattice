/**
 * LatticeLogger property accessors.
 */

import {
  LoggerLevel,
} from "../../loggerLevel/loggerLevel.type.js";

import type {
  LoggerConfiguration,
} from "../../loggerOptions/loggerOptions.type.js";

import type {
  LatticeLoggerContext,
} from "../core/loggerCore.core.js";

/**
 * Gets the logger name.
 */
export function getLoggerName(ctx: LatticeLoggerContext): string {
  ctx.assertActive();
  return ctx.configuration.name;
}

/**
 * Gets the logger level.
 */
export function getLoggerLevel(ctx: LatticeLoggerContext): LoggerLevel {
  ctx.assertActive();
  return ctx.configuration.level;
}

/**
 * Gets whether the logger is enabled.
 */
export function getLoggerEnabled(ctx: LatticeLoggerContext): boolean {
  return !ctx.isDisposed() && ctx.configuration.enabled;
}
