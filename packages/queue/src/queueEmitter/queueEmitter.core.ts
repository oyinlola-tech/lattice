import type { QueueEventEmitter } from "./queueEmitter.type.js";

import type { QueueEventMap } from "../queue/queue.type.js";

type EventName = keyof QueueEventMap;

type Handler<T extends EventName> = (data: QueueEventMap[T]) => void;

interface Subscription {
  event: EventName;
  handler: Handler<EventName>;
}

/**
 * In-memory queue event emitter.
 *
 * Stores handlers in memory and emits events synchronously.
 */
export class InMemoryQueueEventEmitter implements QueueEventEmitter {
  private readonly handlers: Map<EventName, Set<Handler<EventName>>> =
    new Map();

  emit<K extends EventName>(event: K, data: QueueEventMap[K]): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  on<K extends EventName>(event: K, handler: Handler<K>): () => void {
    let handlers = this.handlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(event, handlers);
    }

    handlers.add(handler as Handler<EventName>);

    return () => {
      handlers!.delete(handler as Handler<EventName>);
    };
  }
}

/**
 * Creates an in-memory queue event emitter.
 */
export function createInMemoryQueueEventEmitter(): QueueEventEmitter {
  return new InMemoryQueueEventEmitter();
}

/**
 * Creates a no-op queue event emitter.
 */
export function createNoopQueueEventEmitter(): QueueEventEmitter {
  return {
    emit(): void {},
    on(): () => void {
      return () => {};
    },
  };
}
