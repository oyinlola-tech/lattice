/**
 * @zudoliblib/http/httpStream — Stream state inspection helpers.
 */

import { Readable, Writable } from "node:stream";

export function isReadableEnded(stream: NodeJS.ReadableStream): boolean {
  return (stream as Readable).readableEnded === true;
}

export function isReadableDestroyed(stream: NodeJS.ReadableStream): boolean {
  return (stream as Readable).destroyed === true;
}

export function isWritableFinished(stream: NodeJS.WritableStream): boolean {
  return (stream as Writable).writableFinished === true;
}

export function isWritableDestroyed(stream: NodeJS.WritableStream): boolean {
  return (stream as Writable).destroyed === true;
}
