import {
  RuntimeState,
} from "../runtimeState.state.js";

import type {
  RuntimeBootstrap,
} from "../runtimeBootstrap/runtimeBootstrap.type.js";

import type {
  RuntimeShutdown,
} from "../runtimeShutdown/runtimeShutdown.type.js";

import {
  RuntimeManagerError,
} from "./runtimeManager.error.js";

/**
 * Performs the startup state transition.
 */
export async function performStart(
  bootstrap: RuntimeBootstrap | undefined,
  transitionTo: (next: RuntimeState, reason?: string) => void,
  failState: { failureReason?: unknown },
): Promise<void> {
  transitionTo(RuntimeState.BOOTSTRAPPING, "Runtime startup initiated.");

  try {
    if (bootstrap) {
      const result = await bootstrap.bootstrap();

      if (!result.success) {
        throw new RuntimeManagerError(
          "Runtime bootstrap failed.",
          "BOOTSTRAP_FAILED",
        );
      }
    } else {
      await Promise.resolve();
    }

    transitionTo(RuntimeState.READY, "Runtime startup completed.");
  } catch (error) {
    failState.failureReason = error;
    transitionTo(RuntimeState.FAILED, "Runtime startup failed.");
    throw error;
  }
}

/**
 * Performs the shutdown state transition.
 */
export async function performStop(
  shutdown: RuntimeShutdown | undefined,
  transitionTo: (next: RuntimeState, reason?: string) => void,
  failState: { failureReason?: unknown },
): Promise<void> {
  transitionTo(RuntimeState.STOPPING, "Runtime shutdown initiated.");

  try {
    if (shutdown) {
      const result = await shutdown.shutdown();

      if (!result.success) {
        throw new RuntimeManagerError(
          "Runtime shutdown failed.",
          "SHUTDOWN_FAILED",
        );
      }
    } else {
      await Promise.resolve();
    }

    transitionTo(RuntimeState.STOPPED, "Runtime shutdown completed.");
  } catch (error) {
    failState.failureReason = error;
    transitionTo(RuntimeState.FAILED, "Runtime shutdown failed.");
    throw error;
  }
}
