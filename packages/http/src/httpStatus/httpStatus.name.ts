/**
 * Reverse-lookup of a numeric status code to its symbolic name.
 *
 * Iterates {@link STATUS} to find the key for a given value.
 * Returns `"UNKNOWN"` when no match is found.
 */

import { STATUS } from "./httpStatus.statusConstant.js";

export function statusName(
  status:
    | number,
):
  | string {
  for (
    const [
      name,
      value,
    ] of Object.entries(
      STATUS,
    )
  ) {
    if (
      value ===
      status
    ) {
      return name;
    }
  }

  return "UNKNOWN";
}
