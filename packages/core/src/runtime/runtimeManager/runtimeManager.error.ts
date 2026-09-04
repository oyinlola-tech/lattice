/**
 * @zudojs/core/runtime/runtimeManager/runtimeManager.error
 *
 * RuntimeManagerError extends RuntimeError from @zudojs/errors.
 */

import { RuntimeError } from "@zudojs/errors";

/**
 * Runtime manager error.
 */
export class RuntimeManagerError extends RuntimeError {
  public readonly managerCode: string;

  public constructor(message: string, code: string) {
    super(message, {
      code: "RUNTIME_MANAGER" as any,
      phase: "manager",
    });

    this.name = "RuntimeManagerError";
    this.managerCode = code;
  }
}
