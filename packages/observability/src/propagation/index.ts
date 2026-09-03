/**
 * @zudoliblib/observability — Propagation
 *
 * Context propagation with AsyncLocalStorage for request-scoped IDs.
 */

export {
  createPropagationContext,
  derivePropagationContext,
  getCurrentContext,
  AsyncPropagationManager,
  createPropagationManager,
} from "./propagation.core.js";
