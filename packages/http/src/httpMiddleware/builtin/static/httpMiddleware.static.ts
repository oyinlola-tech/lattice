/**
 * Static file serving middleware.
 *
 * @module httpMiddleware/builtin/static
 */

import type {
  HttpMiddleware,
  HttpMiddlewareContext,
  HttpMiddlewareResult,
} from "../../httpMiddleware.type.js";

import type {
  HttpResponseContext as ResponseContext,
} from "../../../httpResponse/httpResponse.context.js";

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join } from "node:path";

export interface StaticMiddlewareOptions {
  readonly root: string;
  readonly index?: string | string[];
  readonly maxAge?: number;
  readonly immutable?: boolean;
  readonly hidden?: boolean;
  readonly extensions?: string[];
  readonly fallback?: string;
}

const DEFAULT_INDEX = "index.html";
const DEFAULT_MAX_AGE = 3600;
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".gz": "application/gzip",
};

function getContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

function generateETag(data: Buffer): string {
  return `"${createHash("md5").update(data).digest("hex")}"`;
}

export function createStaticMiddleware(
  options: StaticMiddlewareOptions,
): HttpMiddleware {
  const root = options.root;
  const indexFiles = Array.isArray(options.index)
    ? options.index
    : [options.index ?? DEFAULT_INDEX];
  const maxAge = options.maxAge ?? DEFAULT_MAX_AGE;
  const immutable = options.immutable ?? false;
  const hidden = options.hidden ?? false;
  const extensions = options.extensions ?? [];
  const fallback = options.fallback;

  return async (
    context: HttpMiddlewareContext,
    next: () => Promise<ResponseContext>,
  ) => {
    const url = new URL(context.request.url);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    if (!hidden && pathname.includes("/.")) {
      return next();
    }

    const filePaths = [
      join(root, pathname),
      ...extensions.map((ext) => join(root, `${pathname}.${ext}`)),
    ];

    let filePath: string | undefined;
    let fileData: Buffer | undefined;

    for (const candidate of filePaths) {
      try {
        fileData = await readFile(candidate);
        filePath = candidate;
        break;
      } catch {
        // continue
      }
    }

    if (!fileData) {
      for (const indexFile of indexFiles) {
        const indexPath = join(root, `${pathname}/${indexFile}`);
        try {
          fileData = await readFile(indexPath);
          filePath = indexPath;
          break;
        } catch {
          // continue
        }
      }
    }

    if (!fileData) {
      if (fallback) {
        try {
          fileData = await readFile(join(root, fallback));
          filePath = join(root, fallback);
        } catch {
          return next();
        }
      } else {
        return next();
      }
    }

    const etag = generateETag(fileData);
    const lastModified = new Date().toUTCString();
    const contentType = getContentType(filePath ?? "");
    const cacheControl = immutable
      ? `public, max-age=${maxAge}, immutable`
      : `public, max-age=${maxAge}`;

    const responseHeaders = new Headers(
      context.response.headers as Record<string, string>,
    );
    responseHeaders.set("content-type", contentType);
    responseHeaders.set("etag", etag);
    responseHeaders.set("last-modified", lastModified);
    responseHeaders.set("cache-control", cacheControl);
    responseHeaders.set("accept-ranges", "bytes");

    const ifNoneMatch = context.request.headers["if-none-match"];
    if (ifNoneMatch === etag) {
      return {
        ...context.response,
        status: 304,
        headers: responseHeaders,
      } as unknown as ResponseContext;
    }

    return {
      ...context.response,
      body: fileData,
      headers: responseHeaders,
    } as unknown as ResponseContext;
  };
}
