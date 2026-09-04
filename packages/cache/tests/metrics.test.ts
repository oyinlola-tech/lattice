/**
 * @zudojs/cache — Metrics Tests
 *
 * Tests for InMemoryCacheMetrics: hit/miss/set/delete/error counters,
 * latency tracking, hot keys, and histograms.
 */

import { describe, it, expect, beforeEach } from "vitest";

import { InMemoryCacheMetrics, createCacheMetrics } from "../src/metrics.js";

let metrics: InMemoryCacheMetrics;

beforeEach(() => {
  metrics = createCacheMetrics();
});

// ─── Counters ──────────────────────────────────────────────────────────────

describe("InMemoryCacheMetrics — counters", () => {
  it("increments hit counter", () => {
    metrics.incrementHit();
    metrics.incrementHit();
    expect(metrics.getStats().hits).toBe(2);
  });

  it("increments miss counter", () => {
    metrics.incrementMiss();
    expect(metrics.getStats().misses).toBe(1);
  });

  it("increments set counter", () => {
    metrics.incrementSet();
    metrics.incrementSet();
    metrics.incrementSet();
    expect(metrics.getStats().sets).toBe(3);
  });

  it("increments delete counter", () => {
    metrics.incrementDelete();
    expect(metrics.getStats().deletes).toBe(1);
  });

  it("increments error counter", () => {
    metrics.incrementError();
    expect(metrics.getStats().errors).toBe(1);
  });

  it("tracks hit rate correctly", () => {
    metrics.incrementHit();
    metrics.incrementHit();
    metrics.incrementMiss();
    const stats = metrics.getStats();
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it("returns hitRate=0 when no operations", () => {
    expect(metrics.getStats().hitRate).toBe(0);
  });
});

// ─── Hot Keys ──────────────────────────────────────────────────────────────

describe("InMemoryCacheMetrics — hot keys", () => {
  it("tracks per-key hits", () => {
    metrics.incrementHit("key:1");
    metrics.incrementHit("key:1");
    metrics.incrementHit("key:2");
    const hotKeys = metrics.getHotKeys(10);
    expect(hotKeys).toHaveLength(2);
    expect(hotKeys[0].key).toBe("key:1");
    expect(hotKeys[0].hits).toBe(2);
  });

  it("returns top N keys", () => {
    for (let i = 0; i < 5; i++) {
      metrics.incrementHit(`key:${i}`);
    }
    const hotKeys = metrics.getHotKeys(3);
    expect(hotKeys).toHaveLength(3);
  });
});

// ─── Latency ───────────────────────────────────────────────────────────────

describe("InMemoryCacheMetrics — latency", () => {
  it("records latency samples", () => {
    metrics.observeLatency("get" as any, 10);
    metrics.observeLatency("get" as any, 20);
    metrics.observeLatency("get" as any, 30);
    const stats = metrics.getLatencyStats("get" as any);
    expect(stats.count).toBe(3);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(30);
    expect(stats.mean).toBe(20);
  });

  it("computes percentiles", () => {
    for (let i = 1; i <= 100; i++) {
      metrics.observeLatency("get" as any, i);
    }
    const stats = metrics.getLatencyStats("get" as any);
    expect(stats.p50).toBeLessThanOrEqual(51);
    expect(stats.p95).toBeLessThanOrEqual(96);
    expect(stats.p99).toBeLessThanOrEqual(100);
  });

  it("returns zeros for no samples", () => {
    const stats = metrics.getLatencyStats("get" as any);
    expect(stats.count).toBe(0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
  });

  it("trims samples to MAX_LATENCY_SAMPLES", () => {
    for (let i = 0; i < 2000; i++) {
      metrics.observeLatency("set" as any, i);
    }
    const stats = metrics.getLatencyStats("set" as any);
    expect(stats.count).toBeLessThanOrEqual(1000);
  });
});

// ─── Histogram ─────────────────────────────────────────────────────────────

describe("InMemoryCacheMetrics — histogram", () => {
  it("returns latency histogram buckets", () => {
    metrics.observeLatency("get" as any, 5);
    metrics.observeLatency("get" as any, 50);
    metrics.observeLatency("get" as any, 200);
    const histogram = metrics.getLatencyHistogram("get" as any);
    expect(histogram.length).toBeGreaterThan(0);
    expect(histogram[0].bucket).toBeLessThanOrEqual(histogram[1].bucket);
  });

  it("returns empty histogram for no samples", () => {
    const histogram = metrics.getLatencyHistogram("get" as any);
    expect(histogram.every((b) => b.count === 0)).toBe(true);
  });
});

// ─── Reset ─────────────────────────────────────────────────────────────────

describe("InMemoryCacheMetrics — reset", () => {
  it("resets all counters", () => {
    metrics.incrementHit();
    metrics.incrementMiss();
    metrics.incrementSet();
    metrics.incrementDelete();
    metrics.incrementError();
    metrics.reset();
    const stats = metrics.getStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
    expect(stats.sets).toBe(0);
    expect(stats.deletes).toBe(0);
    expect(stats.errors).toBe(0);
  });

  it("resets hot keys and latencies", () => {
    metrics.incrementHit("key");
    metrics.observeLatency("get" as any, 10);
    metrics.reset();
    expect(metrics.getHotKeys()).toEqual([]);
    expect(metrics.getLatencyStats("get" as any).count).toBe(0);
  });
});

// ─── Factory ───────────────────────────────────────────────────────────────

describe("createCacheMetrics", () => {
  it("creates an InMemoryCacheMetrics", () => {
    expect(createCacheMetrics()).toBeInstanceOf(InMemoryCacheMetrics);
  });
});
