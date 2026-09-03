/**
 * @oyinlola141/lattice-cli — Task Runner
 *
 * Runner for executing development tasks (dev servers, builds, tests).
 */

import { execCommand } from "../../utils/utils.exec.js";

export interface TaskDefinition {
  readonly name: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly required?: boolean;
}

export interface TaskResult {
  readonly task: string;
  readonly success: boolean;
  readonly exitCode: number;
  readonly output: string;
}

export class TaskRunner {
  async run(task: TaskDefinition): Promise<TaskResult> {
    try {
      await execCommand(task.command, Array.from(task.args), task.cwd);
      return {
        task: task.name,
        success: true,
        exitCode: 0,
        output: "",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        task: task.name,
        success: false,
        exitCode: 1,
        output: message,
      };
    }
  }

  async runParallel(
    tasks: readonly TaskDefinition[],
  ): Promise<readonly TaskResult[]> {
    const results = await Promise.all(tasks.map((task) => this.run(task)));
    return results;
  }
}
