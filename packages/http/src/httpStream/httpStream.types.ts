/**
 * @zudo/http/httpStream — Stream option and result types.
 */

export interface HTTPStreamOptions {
  readonly highWaterMark?: number;
  readonly signal?: AbortSignal;
}

export interface StreamPipeOptions extends HTTPStreamOptions {
  readonly end?: boolean;
}

export interface StreamResult {
  readonly bytes: number;
}

export interface StreamProgress {
  readonly bytes: number;
  readonly chunks: number;
}

export type StreamProgressHandler = (progress: StreamProgress) => void;
