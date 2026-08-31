/**
 * Container error classes — re-exports from focused files.
 */

export {
  ContainerError,
  createContainerError,
  isContainerError,
} from "./containerError.base.js";
export type { ContainerErrorOptions } from "./containerError.base.js";

export {
  DuplicateRegistrationError,
  RegistrationNotFoundError,
  CircularDependencyError,
  ProviderResolutionError,
  ContainerLifecycleError,
} from "./containerError.registration.js";
