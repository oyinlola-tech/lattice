/**
 * Frontend adapters for framework-agnostic generation.
 *
 * @module adapters/frontend
 */

export type {
  FrontendAdapter,
  FrontendGenerationContext,
  FrontendFeatures,
  DependencyRequirement,
  ValidationResult,
} from "./frontendAdapter.type.js";

export { ReactAdapter } from "./react.adapter.js";
export { NextAdapter } from "./next.adapter.js";
export { VanillaAdapter } from "./vanilla.adapter.js";
