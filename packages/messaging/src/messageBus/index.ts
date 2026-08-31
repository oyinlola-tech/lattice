/**
 * @lattice/messaging/messageBus
 *
 * MessageBus interface and in-memory implementation.
 */

export type {
  MessageBusOptions,
  MessageBus,
} from "./messageBusType.type.js";

export { InMemoryMessageBus, createMessageBus } from "./messageBusCore.js";
