/**
 * @oyinlola141/lattice-types/runtime
 *
 * Injectable runtime primitives — Clock and Random — that let packages
 * avoid direct `Date.now()` and `Math.random()` calls. Tests can substitute
 * deterministic implementations.
 */

/** Returns the current time in milliseconds since the Unix epoch. */
export interface Clock {
  now(): number;
}

/** Returns the current time in seconds since the Unix epoch. */
export interface ClockSeconds {
  nowSeconds(): number;
}

/** Returns cryptographically-secure random values. */
export interface Random {
  /** Returns a random UUID v4 string. */
  uuid(): string;
  /** Returns a random integer in [0, max). */
  int(max: number): number;
  /** Returns a random string of the given length (alphanumeric). */
  string(length: number): string;
  /** Returns a random string of the given length from the given alphabet. */
  custom(length: number, alphabet: string): string;
}

/** Default Clock implementation backed by `Date.now()`. */
export const systemClock: Clock = {
  now: (): number => Date.now(),
};

/** Default ClockSeconds implementation backed by `Math.floor(Date.now() / 1000)`. */
export const systemClockSeconds: ClockSeconds = {
  nowSeconds: (): number => Math.floor(Date.now() / 1000),
};

/** Default Random implementation backed by `node:crypto`. */
export const systemRandom: Random = {
  uuid: (): string => cryptoUUID(),
  int: (max: number): number => cryptoInt(max),
  string: (length: number): string => randomString(length, ALPHANUMERIC),
  custom: (length: number, alphabet: string): string =>
    randomString(length, alphabet),
};

const ALPHANUMERIC =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function cryptoUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // node:crypto fallback (older Node, edge runtimes)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomUUID } = require("node:crypto") as typeof import("node:crypto");
  return randomUUID();
}

function cryptoInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("Random.int(max) requires a positive integer max");
  }
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0]! % max;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomInt } = require("node:crypto") as typeof import("node:crypto");
  return randomInt(max);
}

function randomString(length: number, alphabet: string): string {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError("Random.string(length) requires a non-negative integer");
  }
  if (alphabet.length === 0) {
    throw new RangeError("alphabet must not be empty");
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet.charAt(cryptoInt(alphabet.length));
  }
  return out;
}

/** Deterministic Clock useful for tests. */
export class FixedClock implements Clock {
  private current: number;
  constructor(initial: number = 0) {
    this.current = initial;
  }
  now(): number {
    return this.current;
  }
  set(time: number): void {
    this.current = time;
  }
  advance(deltaMs: number): void {
    this.current += deltaMs;
  }
}

/** Deterministic Random useful for tests. */
export class SeededRandom implements Random {
  private state: number;
  constructor(seed: number = 1) {
    this.state = seed;
  }
  uuid(): string {
    const hex = this.state.toString(16).padStart(8, "0");
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
    return `${hex}-${this.state.toString(16).padStart(8, "0")}-0000-0000-000000000000`;
  }
  int(max: number): number {
    if (!Number.isInteger(max) || max <= 0) {
      throw new RangeError("SeededRandom.int(max) requires a positive integer max");
    }
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
    return this.state % max;
  }
  string(length: number): string {
    return this.custom(length, ALPHANUMERIC);
  }
  custom(length: number, alphabet: string): string {
    let out = "";
    for (let i = 0; i < length; i++) {
      out += alphabet.charAt(this.int(alphabet.length));
    }
    return out;
  }
}
