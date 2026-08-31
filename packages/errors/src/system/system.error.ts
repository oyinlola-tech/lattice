/**
 * System error classes — re-exports from focused files.
 */

export {
  SystemError,
  createSystemError,
  isSystemError,
  SystemOperation,
} from "./systemError.base.js";
export type { SystemErrorOptions } from "./systemError.base.js";

export {
  systemInitializationError,
  systemStartupError,
  systemShutdownError,
  internalSystemError,
} from "./systemError.factory.js";
