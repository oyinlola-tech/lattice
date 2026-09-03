/**
 * @zudoliblib/observability — Sampling
 *
 * Sampling strategies for controlling trace overhead.
 */

import type { SamplingResult, Sampler, SpanContext } from "../types.js";

/** Always records and samples. */
export class AlwaysOnSampler implements Sampler {
  shouldSample(): SamplingResult {
    return { decision: "RECORD_AND_SAMPLE" };
  }
}

/** Never records or samples. */
export class AlwaysOffSampler implements Sampler {
  shouldSample(): SamplingResult {
    return { decision: "DO_NOT_RECORD" };
  }
}

/** Samples a percentage of traces. */
export class ProbabilitySampler implements Sampler {
  private readonly probability: number;

  constructor(probability: number) {
    this.probability = Math.max(0, Math.min(1, probability));
  }

  shouldSample(_parentContext?: SpanContext, traceId?: string): SamplingResult {
    if (!traceId) return { decision: "RECORD_AND_SAMPLE" };
    // Use the first 8 hex chars as a number for deterministic sampling
    const sample = parseInt(traceId.slice(0, 8), 16) / 0xffffffff;
    return sample < this.probability
      ? { decision: "RECORD_AND_SAMPLE" }
      : { decision: "DO_NOT_RECORD" };
  }
}

/** Delegates to parent context's sampling decision, falls back to a root sampler. */
export class ParentBasedSampler implements Sampler {
  private readonly rootSampler: Sampler;

  constructor(rootSampler?: Sampler) {
    this.rootSampler = rootSampler ?? new AlwaysOnSampler();
  }

  shouldSample(parentContext?: SpanContext, traceId?: string): SamplingResult {
    if (!parentContext) {
      return this.rootSampler.shouldSample(parentContext, traceId);
    }
    // If parent is sampled, sample the child too
    const flags = parentContext.traceFlags ?? 0;
    if ((flags & 1) === 1) {
      return { decision: "RECORD_AND_SAMPLE" };
    }
    return { decision: "DO_NOT_RECORD" };
  }
}

/** Creates an always-on sampler. */
export function createAlwaysOnSampler(): AlwaysOnSampler {
  return new AlwaysOnSampler();
}

/** Creates an always-off sampler. */
export function createAlwaysOffSampler(): AlwaysOffSampler {
  return new AlwaysOffSampler();
}

/** Creates a probability sampler. */
export function createProbabilitySampler(
  probability: number,
): ProbabilitySampler {
  return new ProbabilitySampler(probability);
}

/** Creates a parent-based sampler. */
export function createParentBasedSampler(
  rootSampler?: Sampler,
): ParentBasedSampler {
  return new ParentBasedSampler(rootSampler);
}
