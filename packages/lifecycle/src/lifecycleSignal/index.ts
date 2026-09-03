/**
 * @zudo/lifecycle/signal
 *
 * Process signal handler for graceful shutdown.
 */

export {
  installSignalHandlers,
  DEFAULT_SHUTDOWN_SIGNALS,
} from "./lifecycleSignal.handler.js";
export type { SignalHandlerOptions } from "./lifecycleSignal.handler.js";
