/**
 * @lattice/cache — Metrics
 *
 * Tracks cache operation metrics including hit/miss ratios,
 * latency histograms, and error counts.
 */

import type {
  CacheKey,
  CacheMetrics,
  CacheOperation,
  CacheStats,
} from "./types.js";
import {
  LATENCY_BUCKETS,
  MAX_LATENCY_SAMPLES,
} from "./constants.js";

/* -------------------------------------------------------------------------- */
/* Metrics Tracker                                                            */
/* -------------------------------------------------------------------------- */

/**
 * In-memory cache metrics tracker.
 *
 * Collects hit/miss/set/delete/error counts and latency
 * samples per operation type.
 */
export class InMemoryCacheMetrics
  implements CacheMetrics
{
  private hits = 0;
  private misses = 0;
  private sets = 0;
  private deletes = 0;
  private errors = 0;

  /** Per-key hit counts for hot-key detection. */
  private readonly keyHits = new Map<
    CacheKey,
    number
  >();

  /** Latency samples per operation. */
  private readonly latencies = new Map<
    CacheOperation,
    number[]
  >();

  /* ---- Counters ---- */

  incrementHit(key?: CacheKey): void {
    this.hits++;
    if (key) {
      this.keyHits.set(
        key,
        (this.keyHits.get(key) ?? 0) + 1,
      );
    }
  }

  incrementMiss(key?: CacheKey): void {
    this.misses++;
  }

  incrementSet(key?: CacheKey): void {
    this.sets++;
  }

  incrementDelete(key?: CacheKey): void {
    this.deletes++;
  }

  incrementError(key?: CacheKey): void {
    this.errors++;
  }

  /* ---- Latency ---- */

  observeLatency(
    operation: CacheOperation,
    latencyMs: number,
  ): void {
    if (!this.latencies.has(operation)) {
      this.latencies.set(operation, []);
    }

    const samples = this.latencies.get(operation)!;
    samples.push(latencyMs);

    // Trim to max samples
    if (samples.length > MAX_LATENCY_SAMPLES) {
      samples.splice(
        0,
        samples.length - MAX_LATENCY_SAMPLES,
      );
    }
  }

  /* ---- Aggregate Stats ---- */

  /** Returns aggregate cache statistics. */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      errors: this.errors,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * Returns latency statistics for a given operation.
   */
  getLatencyStats(operation: CacheOperation): {
    readonly count: number;
    readonly min: number;
    readonly max: number;
    readonly mean: number;
    readonly p50: number;
    readonly p95: number;
    readonly p99: number;
  } {
    const samples = [
      ...(this.latencies.get(operation) ?? []),
    ].sort((a, b) => a - b);

    if (samples.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sum = samples.reduce((a, b) => a + b, 0);

    return {
      count: samples.length,
      min: samples[0]!,
      max: samples[samples.length - 1]!,
      mean: sum / samples.length,
      p50: percentile(samples, 50),
      p95: percentile(samples, 95),
      p99: percentile(samples, 99),
    };
  }

  /**
   * Returns the top N hottest cache keys by hit count.
   */
  getHotKeys(topN = 10): readonly {
    readonly key: CacheKey;
    readonly hits: number;
  }[] {
    return [...this.keyHits.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([key, hits]) => ({ key, hits }));
  }

  /**
   * Returns latency histogram buckets.
   */
  getLatencyHistogram(
    operation: CacheOperation,
  ): readonly {
    readonly bucket: number;
    readonly count: number;
  }[] {
    const samples =
      this.latencies.get(operation) ?? [];
    const buckets = LATENCY_BUCKETS.map((boundary) => ({
      bucket: boundary,
      count: samples.filter((s) => s <= boundary)
        .length,
    }));

    return buckets;
  }

  /* ---- Reset ---- */

  /** Resets all metrics to zero. */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
    this.keyHits.clear();
    this.latencies.clear();
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function percentile(
  sorted: readonly number[],
  p: number,
): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(
    (p / 100) * sorted.length,
  ) - 1;
  return sorted[Math.max(0, index)]!;
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates an in-memory cache metrics tracker.
 */
export function createCacheMetrics(): InMemoryCacheMetrics {
  return new InMemoryCacheMetrics();
}
