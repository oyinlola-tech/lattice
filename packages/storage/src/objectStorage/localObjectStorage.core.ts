/**
 * @zudoliblib/storage — Local Object Storage
 *
 * Filesystem-based object storage for development and testing.
 */

import {
  readFile,
  writeFile,
  unlink,
  stat,
  mkdir,
  readdir,
} from "node:fs/promises";
import { join, dirname } from "node:path";
import { StorageError } from "@zudoliblib/errors";
import type {
  ObjectStorage,
  ObjectPutOptions,
  ObjectMetadata,
  ObjectData,
  ListObjectsResult,
} from "../types/storage.type.js";

/**
 * Local filesystem object storage implementation.
 */
export class LocalObjectStorage implements ObjectStorage {
  constructor(private readonly basePath: string) {}

  async put(
    key: string,
    data: Uint8Array | ReadableStream<Uint8Array>,
    options?: ObjectPutOptions,
  ): Promise<ObjectMetadata> {
    const filePath = this.resolvePath(key);
    await mkdir(dirname(filePath), { recursive: true });

    let buffer: Buffer;
    if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else {
      // Read stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = data.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      buffer = Buffer.alloc(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
    }

    await writeFile(filePath, buffer);

    const stats = await stat(filePath);
    return {
      key,
      contentType: options?.contentType,
      size: stats.size,
      lastModified: stats.mtime,
      metadata: options?.metadata,
    };
  }

  async get(key: string): Promise<ObjectData | null> {
    const filePath = this.resolvePath(key);

    try {
      const stats = await stat(filePath);
      const buffer = await readFile(filePath);

      const metadata: ObjectMetadata = {
        key,
        size: stats.size,
        lastModified: stats.mtime,
      };

      return {
        metadata,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
          },
        }),
        async arrayBuffer() {
          return buffer.buffer;
        },
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await unlink(filePath);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async metadata(key: string): Promise<ObjectMetadata | null> {
    const filePath = this.resolvePath(key);
    try {
      const stats = await stat(filePath);
      return {
        key,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  async list(
    prefix?: string,
    options?: {
      readonly maxKeys?: number;
      readonly continuationToken?: string;
    },
  ): Promise<ListObjectsResult> {
    const dirPath = prefix ? this.resolvePath(prefix) : this.basePath;
    const maxKeys = options?.maxKeys ?? 1000;

    try {
      const entries = await readdir(dirPath, { recursive: true });
      const objects: ObjectMetadata[] = [];

      for (const entry of entries.slice(0, maxKeys)) {
        const fullPath = join(dirPath, entry as string);
        try {
          const stats = await stat(fullPath);
          if (stats.isFile()) {
            const key = fullPath.slice(this.basePath.length + 1);
            objects.push({
              key,
              size: stats.size,
              lastModified: stats.mtime,
            });
          }
        } catch {
          // Skip inaccessible entries
        }
      }

      return {
        objects,
        isTruncated: entries.length > maxKeys,
      };
    } catch {
      return { objects: [], isTruncated: false };
    }
  }

  private resolvePath(key: string): string {
    // Prevent path traversal
    const resolved = join(this.basePath, key);
    if (!resolved.startsWith(this.basePath)) {
      throw new StorageError(`Path traversal detected: ${key}`, {
        code: "STORAGE_PATH_TRAVERSAL",
        statusCode: 400,
      });
    }
    return resolved;
  }
}
