/**
 * Status lookup helpers.
 *
 * Maps a numeric status code to its reason phrase or category string.
 */

import type { HttpStatusCategory } from "./httpStatus.type.js";
import { STATUS_TEXT } from "./httpStatus.statusTextConstant.js";

export function getStatusText(status: number): string {
  return STATUS_TEXT[status as keyof typeof STATUS_TEXT] ?? "Unknown Status";
}

export function getStatusCategory(status: number): HttpStatusCategory {
  if (status >= 100 && status < 200) {
    return "informational";
  }

  if (status >= 200 && status < 300) {
    return "success";
  }

  if (status >= 300 && status < 400) {
    return "redirection";
  }

  if (status >= 400 && status < 500) {
    return "client-error";
  }

  if (status >= 500 && status < 600) {
    return "server-error";
  }

  return "unknown";
}
