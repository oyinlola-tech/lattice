import type { HashAlgorithm, HmacAlgorithm } from "../../cryptoProvider/index.js";
import type { SignatureAlgorithm } from "../../cryptoProvider/index.js";

export function toBytes(input: Uint8Array | string | ArrayBuffer): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }

  if (typeof input === "string") {
    return new Uint8Array(Buffer.from(input, "utf8"));
  }

  return new Uint8Array(input);
}

export function nodeHashAlgorithm(algorithm: HashAlgorithm | HmacAlgorithm): string {
  const map: Record<string, string> = {
    sha256: "sha256",
    sha384: "sha384",
    sha512: "sha512",
    "sha3-256": "sha3-256",
    "sha3-384": "sha3-384",
    "sha3-512": "sha3-512",
  };
  return map[algorithm] ?? algorithm;
}

export function nodeSignatureAlgorithm(algorithm: SignatureAlgorithm): string {
  switch (algorithm) {
    case "rsa-sha256":
      return "RSA-SHA256";
    case "rsa-sha384":
      return "RSA-SHA384";
    case "rsa-sha512":
      return "RSA-SHA512";
    case "ecdsa-sha256":
      return "ecdsa-SHA256";
    case "ecdsa-sha384":
      return "ecdsa-SHA384";
    case "ecdsa-sha512":
      return "ecdsa-SHA512";
    case "ed25519":
      return "ed25519";
    default:
      throw new TypeError(
        `Unsupported signature algorithm: ${algorithm}.`,
      );
  }
}

export function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function fromBase64Url(value: string): Uint8Array {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}
