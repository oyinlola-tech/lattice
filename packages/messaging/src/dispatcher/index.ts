/**
 * @oyinlola141/lattice-messaging/dispatcher
 *
 * Dispatcher type definitions and default implementation.
 */

export type {
  DispatchResult,
  HandlerExecutionResult,
  DispatchOptions,
  Dispatcher,
} from "./dispatcherType.type.js";

export { DefaultDispatcher, createDispatcher } from "./dispatcherCore.js";
