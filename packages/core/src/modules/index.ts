/**
 * Core Modules
 *
 * Public API for the application module system.
 *
 * This barrel intentionally contains exports only.
 * Module implementation logic belongs in the individual
 * module files.
 */

/*
 * Module contract
 */
export {
  // Export everything publicly exposed by module.ts.
  //
  // Using `export *` here keeps the barrel synchronized
  // with the module contract as it evolves.
} from "./module.js";

export * from "./module.js";

/*
 * Module definition
 */
export * from "./module-definition.js";

/*
 * Module metadata
 */
export * from "./module-metadata.js";

/*
 * Module context
 */
export * from "./module-context.js";

/*
 * Module dependency graph and dependency utilities
 */
export * from "./module-dependency.js";

/*
 * Module registry
 */
export * from "./module-registry.js";

/*
 * Module loading
 */
export * from "./module-loader.js";

/*
 * Module lifecycle
 */
export * from "./module-lifecycle.js";

/*
 * Module errors
 */
export * from "./module-error.js";