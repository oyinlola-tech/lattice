/**
 * In-memory queue implementation.
 *
 * Good for testing, development, and simple applications.
 * Jobs are lost when the application crashes.
 */
export {
  InMemoryQueue,
  createInMemoryQueue,
} from "./inMemoryQueue.core.js";
