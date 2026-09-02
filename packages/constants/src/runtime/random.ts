/**
 * Injectable Random interface for deterministic randomness in tests.
 *
 * @module runtime/random
 */

/**
 * Provides deterministic randomness for testing.
 */
export interface Random {
  /**
   * Returns a random float between 0 (inclusive) and 1 (exclusive).
   */
  random(): number;

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   */
  randomInt(min: number, max: number): number;

  /**
   * Generates a random string of the specified length using alphanumeric characters.
   */
  randomString(length: number): string;

  /**
   * Generates random bytes.
   */
  randomBytes(length: number): Uint8Array;
}

/**
 * Default random using real system randomness.
 */
export const systemRandom: Random = {
  random: () => Math.random(),
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomString: (length) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  },
  randomBytes: (length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  },
};

/**
 * Creates a mock random with a seeded sequence for deterministic testing.
 */
export function createMockRandom(seed: number = 1): Random {
  let state = seed;

  function next(): number {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  }

  return {
    random: next,
    randomInt: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    randomString: (length) => {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(next() * chars.length)];
      }
      return result;
    },
    randomBytes: (length) => {
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(next() * 256);
      }
      return bytes;
    },
  };
}
