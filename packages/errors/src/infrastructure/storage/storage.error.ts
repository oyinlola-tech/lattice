/**
 * Storage error classes — re-exports from focused files.
 */

export {
  StorageError,
  createStorageError,
  isStorageError,
  StorageOperation,
} from "./storageError.base.js";
export type { StorageErrorOptions } from "./storageError.base.js";

export {
  storageReadError,
  storageWriteError,
  storageUploadError,
  storageDownloadError,
  storageDeleteError,
  storageNotFoundError,
} from "./storageError.factory.js";
