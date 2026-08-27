/**
 * Composite logger transports.
 */

import type {
  LoggerEntry,
} from "../../loggerEntry/loggerEntry.type.js";

import type {
  LoggerTransportLike,
  LoggerTransportOptions,
  RegisteredLoggerTransport,
} from "../loggerTransport.type.js";

import {
  createLoggerTransport,
  writeLoggerTransport,
} from "../loggerTransport.core.js";

import {
  createBufferedLoggerTransport,
} from "./loggerTransportComposite.buffered.js";

/**
 * Creates a transport that forwards entries to another
 * transport only when a predicate passes.
 */
export function createConditionalLoggerTransport(
  transport:
    LoggerTransportLike,
  predicate:
    (
      entry:
        LoggerEntry,
    ) =>
      boolean |
      Promise<boolean>,
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    async (
      entry,
      context,
    ) => {
      if (
        await predicate(
          entry,
        )
      ) {
        await writeLoggerTransport(
          transport,
          entry,
          context,
        );
      }
    },
    options,
  );
}

/**
 * Creates a transport that forwards entries to multiple
 * transports.
 */
export function createMultiLoggerTransport(
  transports:
    readonly LoggerTransportLike[],
  options:
    LoggerTransportOptions = {},
):
  RegisteredLoggerTransport {
  return createLoggerTransport(
    async (
      entry,
      context,
    ) => {
      for (
        const transport of
        transports
      ) {
        await writeLoggerTransport(
          transport,
          entry,
          context,
        );
      }
    },
    options,
  );
}

export { createBufferedLoggerTransport };
