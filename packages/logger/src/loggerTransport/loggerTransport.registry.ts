/**
 * Logger transport registry re-exports.
 *
 * This file maintains backward compatibility by re-exporting
 * all transport functions from their new locations.
 */

export {
  isLoggerTransportFunction,
  isLoggerTransportObject,
  isLoggerTransport,
} from "./loggerTransportGuard.js";

export { createConsoleLoggerTransport } from "./loggerTransportConsole/loggerTransportConsole.core.js";

export {
  createConditionalLoggerTransport,
  createMultiLoggerTransport,
  createBufferedLoggerTransport,
} from "./loggerTransportComposite/loggerTransportComposite.js";

export {
  serializeTransportEntry,
  closeLoggerTransport,
  flushLoggerTransport,
} from "./loggerTransportHelpers/loggerTransportHelpers.js";
