/**
 * Trust proxy compilation.
 *
 * @module httpTrustProxy/compilation
 */

import type { TrustProxy } from "./httpTrustProxy.type.js";

/**
 * Compiles a trust proxy configuration into a function that
 * determines whether a given proxy address is trusted.
 */
export function compileTrustProxy(
  trustProxy: TrustProxy,
): (value: string, index: number) => boolean {
  if (typeof trustProxy === "function") {
    return trustProxy;
  }

  if (trustProxy === true) {
    return () => true;
  }

  if (trustProxy === false) {
    return () => false;
  }

  if (trustProxy === "all") {
    return () => true;
  }

  if (trustProxy === "linklocal") {
    return (value) =>
      value === "127.0.0.1" ||
      value === "::1" ||
      value === "::ffff:127.0.0.1";
  }

  if (trustProxy === "loopback") {
    return (value) =>
      isLoopbackAddress(value);
  }

  if (Array.isArray(trustProxy)) {
    const trustSet = new Set(trustProxy);
    return (value) => trustSet.has(value);
  }

  if (typeof trustProxy === "string") {
    const trustSet = new Set(
      trustProxy.split(",").map((s) => s.trim()),
    );
    return (value) => trustSet.has(value);
  }

  return () => false;
}

function isLoopbackAddress(value: string): boolean {
  return (
    value === "127.0.0.1" ||
    value === "::1" ||
    value === "::ffff:127.0.0.1" ||
    value === "localhost" ||
    value.startsWith("127.") ||
    value.startsWith("::1")
  );
}
