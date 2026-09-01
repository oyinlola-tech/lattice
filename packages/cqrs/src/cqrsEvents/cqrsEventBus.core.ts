/**
 * CQRS event bus.
 *
 * Re-exports the Lattice EventBus and factory functions.
 * The base EventBus supports all CQRS publishing needs with
 * middleware, registry, and emitter infrastructure.
 */

export {
  EventBus,
  type EventBusOptions,
  type EventPublishResult,
  createEventBus,
  createStartedEventBus,
  type PublishOptions,
  EventBusState,
  type EventBusEvent,
  type EventBusListener,
} from "@oyinlola141/lattice-events";
