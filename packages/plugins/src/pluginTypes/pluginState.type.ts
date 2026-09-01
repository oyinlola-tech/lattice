/**
 * Plugin lifecycle states.
 */
export type PluginState =
  | "registered"
  | "installing"
  | "installed"
  | "initializing"
  | "initialized"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "disposing"
  | "disposed"
  | "failed";

/**
 * Valid state transitions for the plugin state machine.
 */
export const VALID_STATE_TRANSITIONS: Readonly<
  Record<PluginState, readonly PluginState[]>
> = {
  registered: ["installing"],
  installing: ["installed", "failed"],
  installed: ["initializing", "stopping"],
  initializing: ["initialized", "failed"],
  initialized: ["starting", "stopping"],
  starting: ["started", "failed"],
  started: ["stopping"],
  stopping: ["stopped", "failed"],
  stopped: ["disposing", "starting"],
  disposing: ["disposed", "failed"],
  disposed: [],
  failed: ["disposing"],
} as const;

/**
 * Determines whether a state transition is valid.
 */
export function isValidTransition(from: PluginState, to: PluginState): boolean {
  return VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
