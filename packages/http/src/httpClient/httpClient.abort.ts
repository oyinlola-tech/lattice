/**
 * HTTP client abort signal combining.
 *
 * @module httpClient/abort
 */

export function combineAbortSignals(
  first?: AbortSignal,
  second?: AbortSignal,
): AbortSignal | undefined {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
    return (
      AbortSignal as typeof AbortSignal & {
        any(signals: readonly AbortSignal[]): AbortSignal;
      }
    ).any([first, second]);
  }

  const controller = new AbortController();

  const abort = (event: Event) => {
    controller.abort((event.target as AbortSignal).reason);
  };

  if (first.aborted) {
    controller.abort(first.reason);
  } else {
    first.addEventListener("abort", abort, { once: true });
  }

  if (second.aborted) {
    controller.abort(second.reason);
  } else {
    second.addEventListener("abort", abort, { once: true });
  }

  return controller.signal;
}
