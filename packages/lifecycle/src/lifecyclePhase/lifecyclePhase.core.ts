/**
 * @zudolib/lifecycle/phase
 *
 * Lifecycle phase ordering for startup and shutdown sequences.
 */

import { LifecyclePhase } from "@zudolib/constants";

/** Ordered phases for startup. */
export const STARTUP_PHASES: readonly LifecyclePhase[] = Object.freeze([
  LifecyclePhase.INITIALIZE,
  LifecyclePhase.START,
  LifecyclePhase.READY,
]);

/** Ordered phases for shutdown (reversed). */
export const SHUTDOWN_PHASES: readonly LifecyclePhase[] = Object.freeze([
  LifecyclePhase.STOP,
  LifecyclePhase.DISPOSE,
]);

/**
 * Returns the phase hook name for a given lifecycle phase.
 */
export function getPhaseHookName(phase: LifecyclePhase): string {
  switch (phase) {
    case LifecyclePhase.INITIALIZE:
      return "initialize";
    case LifecyclePhase.START:
      return "start";
    case LifecyclePhase.READY:
      return "ready";
    case LifecyclePhase.STOP:
      return "stop";
    case LifecyclePhase.DISPOSE:
      return "dispose";
  }
}

/**
 * Returns the on-prefixed hook name for a component method.
 */
export function getComponentMethod(phase: LifecyclePhase): string {
  switch (phase) {
    case LifecyclePhase.INITIALIZE:
      return "initialize";
    case LifecyclePhase.START:
      return "start";
    case LifecyclePhase.READY:
      return "ready";
    case LifecyclePhase.STOP:
      return "stop";
    case LifecyclePhase.DISPOSE:
      return "dispose";
  }
}
