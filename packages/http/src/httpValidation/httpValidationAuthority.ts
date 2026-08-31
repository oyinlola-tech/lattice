/**
 * HTTP authority validation.
 *
 * Validates authority-form (host:port) as used in
 * CONNECT requests and absolute-form URIs.
 */

import {
  isValidHostname,
} from "./httpValidationHostname.js";
import {
  isValidPort,
} from "./httpValidationPort.js";

export function isValidAuthority(
  authority:
    | string
    | undefined
    | null,
): boolean {
  if (
    authority ===
      undefined ||
    authority ===
      null ||
    authority.length ===
      0 ||
    /[\r\n\s]/.test(
      authority,
    )
  ) {
    return false;
  }

  /*
   * IPv6 literal.
   */
  if (
    authority.startsWith(
      "[",
    )
  ) {
    const match =
      /^\[[^\]]+\](?::\d{1,5})?$/.exec(
        authority,
      );

    if (
      !match
    ) {
      return false;
    }

    const colonIdx = authority.lastIndexOf(":");
    const port = colonIdx >= 0 ? Number(authority.slice(colonIdx + 1)) : undefined;

    return (
      port ===
        undefined ||
      isValidPort(
        port,
      )
    );
  }

  const separator =
    authority.lastIndexOf(
      ":",
    );

  if (
    separator ===
    -1
  ) {
    return isValidHostname(
      authority,
    );
  }

  const hostname =
    authority.slice(
      0,
      separator,
    );

  const portValue =
    authority.slice(
      separator + 1,
    );

  if (
    !isValidHostname(
      hostname,
    )
  ) {
    return false;
  }

  if (
    portValue.length ===
    0
  ) {
    return false;
  }

  const port =
    Number(
      portValue,
    );

  return (
    Number.isInteger(
      port,
    ) &&
    isValidPort(
      port,
    )
  );
}
