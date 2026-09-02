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
export { VueAdapter } from "./vue.adapter.js";
export { NuxtAdapter } from "./nuxt.adapter.js";
export { AngularAdapter } from "./angular.adapter.js";
export { SvelteAdapter } from "./svelte.adapter.js";
export { SvelteKitAdapter } from "./sveltekit.adapter.js";
export { AstroAdapter } from "./astro.adapter.js";
export { VanillaAdapter } from "./vanilla.adapter.js";
export { FlutterAdapter } from "./flutter.adapter.js";
export { ReactNativeAdapter } from "./react-native.adapter.js";
