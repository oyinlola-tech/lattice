/**
 * ZudojsLogger level methods.
 */

import {
  LoggerLevel,
  shouldLog,
} from "../../../loggerLevel/loggerLevel.type.js";

import type { LogOptions } from "../../../loggerOptions/loggerOptions.type.js";

import { LoggerConfigurationError } from "../../../loggerErrors/loggerError.base.js";

import { createEntry } from "./loggerCoreMethods.entry.js";

import { dispatchEntry } from "./loggerCoreMethods.dispatch.js";

import type { ZudojsLoggerContext } from "../../core/loggerCore.core.js";

/**
 * Level logging methods extracted from ZudojsLogger.
 */
export function logAtLevel(
  ctx: ZudojsLoggerContext,
  level: LoggerLevel,
  message: string,
  options: LogOptions = {},
): void {
  ctx.assertActive();

  if (
    !ctx.configuration.enabled ||
    !shouldLog(ctx.configuration.level, level)
  ) {
    return;
  }

  if (typeof message !== "string") {
    throw new LoggerConfigurationError("Logger message must be a string.");
  }

  const entry = createEntry(
    ctx.configuration,
    ctx.contextStorage,
    level,
    message,
    options,
  );

  void dispatchEntry(ctx.configuration, entry, (error: Error) =>
    ctx.handleInfrastructureError(error),
  );
}
