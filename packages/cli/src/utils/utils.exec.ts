import { exec as execAsync } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execAsync);

export interface ExecResult {
  readonly stdout: string;
  readonly stderr: string;
}

export async function execCommand(
  command: string,
  cwd: string,
): Promise<ExecResult> {
  const { stdout, stderr } = await exec(command, { cwd, timeout: 120000 });
  return { stdout, stderr };
}
