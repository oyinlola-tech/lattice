/**
 * zudojs-cli — Process Runner
 *
 * Runner for executing system processes.
 */

import { execCommand } from "../../utils/utils.exec.js";

export interface ProcessOptions {
  readonly cwd: string;
  readonly env?: Record<string, string>;
  readonly stdio?: "inherit" | "pipe" | "ignore";
}

export class ProcessRunner {
  async run(
    command: string,
    args: readonly string[],
    options: ProcessOptions,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      await execCommand(command, Array.from(args), options.cwd);
      return { stdout: "", stderr: "", exitCode: 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { stdout: "", stderr: message, exitCode: 1 };
    }
  }

  async runBackground(
    command: string,
    args: readonly string[],
    options: ProcessOptions,
  ): Promise<{ pid: number }> {
    const { spawn } = await import("node:child_process");

    const child = spawn(command, Array.from(args), {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: options.stdio ?? "ignore",
    });

    return { pid: child.pid ?? 0 };
  }
}
