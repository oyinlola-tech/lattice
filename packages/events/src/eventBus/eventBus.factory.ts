/**
 * Event bus factory functions for Lattice.
 */

import type {
  EventBusOptions,
} from "./eventBus.type.js";

import {
  EventBus,
} from "./eventBus.core.js";

/**
 * Creates an EventBus.
 */
export function createEventBus(
  options:
    EventBusOptions = {},
):
  EventBus {
  return new EventBus(
    options,
  );
}

/**
 * Creates and starts an EventBus.
 */
export function createStartedEventBus(
  options:
    EventBusOptions = {},
):
  EventBus {
  return new EventBus(
    options,
  ).start();
}
