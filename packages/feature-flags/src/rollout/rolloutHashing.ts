/**
 * Deterministic string hashing using FNV-1a.
 *
 * Used for sticky percentage rollouts — same input always produces the same bucket.
 *
 * @module rollout/rolloutHashing
 */

/** FNV offset basis (32-bit). */
const FNV_OFFSET_BASIS = 2166136261;

/** FNV prime (32-bit). */
const FNV_PRIME = 16777619;

/**
 * Compute a deterministic 32-bit unsigned hash of a string using FNV-1a.
 *
 * @param value - The string to hash.
 * @returns An unsigned 32-bit integer hash.
 */
export function hashString(value: string): number {
  let hash = FNV_OFFSET_BASIS;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return hash >>> 0;
}
