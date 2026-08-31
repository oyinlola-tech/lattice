/**
 * HTTP hostname validation.
 *
 * Validates DNS hostnames and localhost per RFC 1123 Section 2.1.
 */

export function isValidHostname(
  hostname:
    | string
    | undefined
    | null,
): boolean {
  if (
    hostname ===
      undefined ||
    hostname ===
      null ||
    hostname.length ===
      0 ||
    hostname.length >
      253
  ) {
    return false;
  }

  if (
    hostname ===
      "localhost"
  ) {
    return true;
  }

  if (
    hostname.endsWith(
      ".",
    )
  ) {
    hostname =
      hostname.slice(
        0,
        -1,
      );
  }

  const labels =
    hostname.split(
      ".",
    );

  if (
    labels.length ===
    0
  ) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length >
        0 &&
      label.length <=
        63 &&
      /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(
        label,
      ),
  );
}
