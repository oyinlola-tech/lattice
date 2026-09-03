import { mkdir, writeFile as writeFileAsync } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

function assertSafePath(basePath: string, filePath: string): void {
  const resolved = join(basePath, filePath);
  const relativePath = relative(basePath, resolved);

  if (relativePath.startsWith("..") || relativePath.includes("..")) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }
}

export async function writeFile(
  basePath: string,
  filePath: string,
  content: string,
): Promise<void> {
  assertSafePath(basePath, filePath);

  const fullPath = join(basePath, filePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFileAsync(fullPath, content);
}

export async function writeFileTree(
  basePath: string,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  for (const [filePath, content] of Object.entries(files)) {
    await writeFile(basePath, filePath, content);
  }
}
