/**
 * Called when the application is being initialized.
 *
 * Use this hook for preparing dependencies, validating configuration,
 * registering resources, or performing other initialization work.
 */
export interface OnInitialize {
  onInitialize(): Promise<void> | void;
}

/**
 * Called when the application is starting.
 *
 * Use this hook for starting active processes such as HTTP servers,
 * queue consumers, schedulers, workers, or message listeners.
 */
export interface OnStart {
  onStart(): Promise<void> | void;
}

/**
 * Called when the application is stopping.
 *
 * Use this hook to stop accepting new work and gracefully terminate
 * active processes.
 */
export interface OnStop {
  onStop(): Promise<void> | void;
}

/**
 * Called when the application is being destroyed.
 *
 * Use this hook for releasing resources such as connections,
 * file handles, timers, subscriptions, and external clients.
 */
export interface OnDestroy {
  onDestroy(): Promise<void> | void;
}

/**
 * A component that participates in one or more lifecycle phases.
 *
 * Components can implement only the hooks they actually need.
 */
export type LifecycleHook = Partial<OnInitialize> &
  Partial<OnStart> &
  Partial<OnStop> &
  Partial<OnDestroy>;

/**
 * Type guard for initialization hooks.
 */
export function hasInitializeHook(value: unknown): value is OnInitialize {
  return (
    typeof value === "object" &&
    value !== null &&
    "onInitialize" in value &&
    typeof value.onInitialize === "function"
  );
}

/**
 * Type guard for start hooks.
 */
export function hasStartHook(value: unknown): value is OnStart {
  return (
    typeof value === "object" &&
    value !== null &&
    "onStart" in value &&
    typeof value.onStart === "function"
  );
}

/**
 * Type guard for stop hooks.
 */
export function hasStopHook(value: unknown): value is OnStop {
  return (
    typeof value === "object" &&
    value !== null &&
    "onStop" in value &&
    typeof value.onStop === "function"
  );
}

/**
 * Type guard for destroy hooks.
 */
export function hasDestroyHook(value: unknown): value is OnDestroy {
  return (
    typeof value === "object" &&
    value !== null &&
    "onDestroy" in value &&
    typeof value.onDestroy === "function"
  );
}
