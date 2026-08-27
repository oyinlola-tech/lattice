/**
 * LatticeLogger child and context methods.
 */

import type {
  LoggerContext,
} from "../../../loggerContext/loggerContext.core.js";

import type {
  ChildLoggerOptions,
} from "../../../loggerOptions/loggerOptions.type.js";

import {
  createChildLoggerOptions,
} from "../../../loggerOptions/loggerOptions.type.js";

import type {
  Logger,
} from "../../core/loggerCore.type.js";

import { ContextLogger } from "../../core/loggerCore.context.js";

import type {
  LatticeLoggerContext,
} from "../../core/loggerCore.core.js";

/**
 * Creates a child logger.
 */
export function childLogger(
  ctx: LatticeLoggerContext,
  options: ChildLoggerOptions = {},
): Logger {
  ctx.assertActive();

  const childOptions =
    createChildLoggerOptions(ctx.configuration, options);

  return ctx.createChildLogger(childOptions);
}

/**
 * Creates a logger with scoped context.
 */
export function withContextLogger(
  ctx: LatticeLoggerContext,
  context: LoggerContext,
): Logger {
  ctx.assertActive();

  const child = childLogger(ctx);

  return new ContextLogger(child, context);
}
