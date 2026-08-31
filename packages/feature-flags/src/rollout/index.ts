/**
 * Deterministic rollout infrastructure — hashing and bucketing.
 *
 * @module rollout
 */

export { hashString } from "./rolloutHashing.js";
export { getBucket, isInRollout } from "./rolloutBucketing.js";
