import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ExecResult {
  readonly stdout: string;
  readonly stderr: string;
}

export async function execCommand(
  file: string,
  args: readonly string[],
  cwd: string,
): Promise<ExecResult> {
  const { stdout, stderr } = await execFileAsync(file, args, {
    cwd,
    timeout: 120000,
  });
  return { stdout, stderr };
}
