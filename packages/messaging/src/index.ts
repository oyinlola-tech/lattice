/**
 * @zudo/messaging
 *
 * In-process message bus infrastructure for the Lattice framework.
 *
 * Provides the foundational messaging primitives that CQRS and Events
 * specialize into commands/queries and domain events respectively.
 *
 * @module @zudo/messaging
 */

// Core message types and factory
export * from "./message/index.js";

// Message context (correlation, causation, headers)
export * from "./messageContext/index.js";

// Message handler types
export * from "./messageHandler/index.js";

// Handler registry
export * from "./handlerRegistry/index.js";

// Message middleware
export * from "./messageMiddleware/index.js";

// Dispatcher
export * from "./dispatcher/index.js";

// Message bus
export * from "./messageBus/index.js";

// Error re-exports
export * from "./errors/index.js";
