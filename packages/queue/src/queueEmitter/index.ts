/**
 * Queue event emitter abstraction.
 *
 * Provides event emission for queue and job lifecycle events.
 * Can be implemented by different backends (in-memory, @oyinlola141/lattice-events, etc.).
 */
export {
  createNoopQueueEventEmitter,
  createInMemoryQueueEventEmitter,
  InMemoryQueueEventEmitter,
} from "./queueEmitter.core.js";

export type { QueueEventEmitter } from "./queueEmitter.type.js";
