import { randomBytes } from "node:crypto";

export async function randomBytesImpl(length: number): Promise<Uint8Array> {
  if (!Number.isInteger(length) || length <= 0) {
    throw new TypeError("randomBytes length must be a positive integer.");
  }

  return new Uint8Array(randomBytes(length));
}

export async function randomIntImpl(min: number, max: number): Promise<number> {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new TypeError("randomInt bounds must be integers.");
  }

  if (max <= min) {
    throw new RangeError("max must be greater than min.");
  }

  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const limit = Math.floor(256 ** bytesNeeded / range) * range;

  while (true) {
    const bytes = await randomBytesImpl(bytesNeeded);
    let value = 0;

    for (let i = 0; i < bytesNeeded; i += 1) {
      value = (value << 8) | bytes[i]!;
    }

    value = value >>> 0;

    if (value < limit) {
      return min + (value % range);
    }
  }
}

export async function randomUUIDImpl(): Promise<string> {
  const bytes = await randomBytesImpl(16);

  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
