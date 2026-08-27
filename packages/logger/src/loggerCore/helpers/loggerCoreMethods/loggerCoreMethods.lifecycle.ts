/**
 * LatticeLogger lifecycle methods.
 */

import {
  LoggerLevel,
} from "../../../loggerLevel/loggerLevel.type.js";

import {
  createLoggerTransport,
} from "../../../loggerTransport/loggerTransport.core.js";

import {
  isLoggerTransport,
} from "../../../loggerTransport/loggerTransportGuard.js";

import {
  LoggerConfigurationError,
} from "../../../loggerErrors/loggerError.base.js";

import type {
  LatticeLoggerContext,
} from "../../core/loggerCore.core.js";

/**
 * Sets the logger level.
 */
export function setLoggerLevel(
  ctx: LatticeLoggerContext,
  level: LoggerLevel,
): void {
  ctx.assertActive();

  if (
    !Number.isInteger(level) ||
    level < LoggerLevel.FATAL ||
    level > LoggerLevel.TRACE
  ) {
    throw new LoggerConfigurationError(
      `Invalid logger level: ${String(level)}.`,
    );
  }

  ctx.assertMutable();

  ctx.updateConfiguration({
    ...ctx.configuration,
    level,
  });
}

/**
 * Enables the logger.
 */
export function enableLogger(
  ctx: LatticeLoggerContext,
): void {
  ctx.assertActive();
  ctx.assertMutable();

  ctx.updateConfiguration({
    ...ctx.configuration,
    enabled: true,
  });
}

/**
 * Disables the logger.
 */
export function disableLogger(
  ctx: LatticeLoggerContext,
): void {
  ctx.assertActive();
  ctx.assertMutable();

  ctx.updateConfiguration({
    ...ctx.configuration,
    enabled: false,
  });
}

/**
 * Flushes all transport buffers.
 */
export async function flushLogger(
  ctx: LatticeLoggerContext,
): Promise<void> {
  ctx.assertActive();

  for (const transport of ctx.configuration.transports) {
    if (!isLoggerTransport(transport)) {
      continue;
    }

    const registered = createLoggerTransport(transport);

    if (!registered.enabled) {
      continue;
    }

    if (registered.flush) {
      await registered.flush();
    }
  }
}

/**
 * Closes all transports and marks logger as disposed.
 */
export async function closeLogger(
  ctx: LatticeLoggerContext,
): Promise<void> {
  if (ctx.isDisposed()) {
    return;
  }

  for (const transport of ctx.configuration.transports) {
    if (!isLoggerTransport(transport)) {
      continue;
    }

    const registered = createLoggerTransport(transport);

    if (registered.close) {
      await registered.close();
    }
  }

  ctx.markDisposed();
}
