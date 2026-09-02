import { mkdir, writeFile as writeFileAsync } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function writeFile(
  basePath: string,
  filePath: string,
  content: string,
): Promise<void> {
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
