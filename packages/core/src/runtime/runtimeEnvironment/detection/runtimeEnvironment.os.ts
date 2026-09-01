import type { RuntimeOS } from "../runtimeEnvironment.type.js";

import { getProcessObject } from "./runtimeEnvironment.detection.js";

export function getNodeOsObject(): RuntimeOS | undefined {
  const runtimeProcess = getProcessObject();

  const requireFunction = (
    globalThis as {
      require?: (id: string) => unknown;
    }
  ).require;

  if (!requireFunction || !runtimeProcess) {
    return undefined;
  }

  try {
    return requireFunction("node:os") as RuntimeOS;
  } catch {
    return undefined;
  }
}

export function safeCall<T>(fn: (() => T) | undefined): T | undefined {
  if (!fn) {
    return undefined;
  }

  try {
    return fn();
  } catch {
    return undefined;
  }
}
