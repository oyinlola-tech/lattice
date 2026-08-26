export {
  Container,
  ContainerScopeContext,
  createContainer,
  createStartedContainer,
} from "./container.js";

export type {
  ContainerScopeOptions,
} from "./container.js";

export {
  ContainerScope,
} from "./container-scope.js";

export type {
  ContainerScopeOptions as ScopeOptions,
} from "./container.js";

export {
  ContainerRegistry,
  RegistryOperation,
  DuplicateRegistrationError,
  RegistrationNotFoundError,
  createContainerRegistry,
} from "./container-registry.js";

export type {
  ContainerRegistryOptions,
  RegistryChangeEvent,
  RegistryListener,
  RegistryToken,
} from "./container-registry.js";

export {
  ContainerResolver,
  CircularDependencyError,
  ProviderResolutionError,
  createContainerResolver,
} from "./container-resolution.js";

export type {
  ResolutionCache,
  ResolutionPath,
  ResolutionOptions,
  ResolutionResult,
} from "./container-resolution.js";

export {
  ContainerLifecycle,
  ContainerLifecycleOwner,
  ContainerDisposalError,
  isDisposable,
  isAsyncDisposable,
  isDisposableInstance,
  createContainerLifecycle,
} from "./container-lifecycle.js";

export type {
  Disposable,
  AsyncDisposable,
  DisposableInstance,
  TrackedInstance,
  ContainerLifecycleOptions,
} from "./container-lifecycle.js";

export {
  ContainerLogLevel,
  DEFAULT_CONTAINER_LOG_LEVEL,
  DEFAULT_CONTAINER_NAME,
  DEFAULT_AUTO_DISPOSE,
  DEFAULT_ALLOW_SCOPES,
  DEFAULT_FREEZE_REGISTRATIONS,
  DEFAULT_RESOLUTION_OPTIONS,
  resolveContainerOptions,
  validateResolutionOptions,
  isContainerLogLevel,
  allowsContainerScopes,
  shouldAutoDisposeContainer,
  canModifyRegistrations,
} from "./container-options.js";

export type {
  ContainerOptions,
  ResolvedContainerOptions,
  ContainerResolutionOptions,
} from "./container-options.js";

export {
  classProvider,
  factoryProvider,
  valueProvider,
  existingProvider,
  provideClass,
  provideFactory,
  provideValue,
  provideExisting,
  getProviderToken,
  normalizeProvider,
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
  isExistingProvider,
  isTokenProvider,
  hasInjectedDependencies,
} from "./container-provider.js";

export type {
  ProviderToken,
  ClassProvider,
  FactoryProvider,
  ValueProvider,
  ExistingProvider,
  Provider,
  TokenProvider,
  ContainerProvider,
  ClassRegistration,
  FactoryRegistration,
  ValueRegistration,
  ExistingRegistration,
} from "./container-provider.js";

export {
  createRegistration,
  createMutableRegistrationState,
  freezeRegistration,
  markRegistrationInitialized,
  getRegistrationToken,
  getRegistrationProviderToken,
  isSingletonRegistration,
  isScopedRegistration,
  isTransientRegistration,
  shouldCacheRegistration,
  describeRegistration,
  withRegistrationScope,
  withRegistrationMetadata,
  assertValidRegistrationToken,
  assertValidProvider,
  defineRegistration,
  DEFAULT_REGISTRATION_SCOPE,
  createRegistrationMap,
} from "./container-registration.js";

export type {
  RegistrationToken,
  RegistrationMetadata,
  ContainerRegistration,
  CreateRegistrationOptions,
  MutableRegistrationState,
  RegistrationMap,
} from "./container-registration.js";

export {
  createToken,
  createGlobalToken,
  isInjectionToken,
  isConstructorToken,
  isSymbolToken,
  isStringToken,
  unwrapToken,
  describeToken,
} from "./container-token.js";

export type {
  InjectionToken,
} from "./container-token.js";

export type {
  Token,
  Constructor,
} from "./container-token.js";