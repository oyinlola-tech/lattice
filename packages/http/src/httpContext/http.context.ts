import type { Logger } from "@zudoliblib/logger";

import type {
  HTTPContext,
  HTTPRequest,
  HTTPResponse,
  HTTPState,
} from "../httpTypes/http.types.js";

/* -------------------------------------------------------------------------- */
/* Context Options                                                             */
/* -------------------------------------------------------------------------- */

export interface HTTPContextOptions<State extends HTTPState = HTTPState> {
  readonly request: HTTPRequest;
  readonly response: HTTPResponse;
  readonly logger: Logger;
  readonly state?: State;
  readonly signal?: AbortSignal;
}

/* -------------------------------------------------------------------------- */
/* HTTP Context                                                               */
/* -------------------------------------------------------------------------- */

export class DefaultHTTPContext<
  State extends HTTPState = HTTPState,
> implements HTTPContext<State> {
  public readonly request: HTTPRequest;

  public readonly response: HTTPResponse;

  public readonly state: State;

  public readonly logger: Logger;

  public readonly signal: AbortSignal;

  public readonly startedAt: number;

  private readonly values: Map<string, unknown>;

  constructor(options: HTTPContextOptions<State>) {
    this.request = options.request;

    this.response = options.response;

    this.state = options.state ?? ({} as State);

    this.logger = options.logger;

    this.signal = options.signal ?? createContextAbortSignal(options.request);

    this.startedAt = Date.now();

    this.values = new Map<string, unknown>();
  }

  /* ------------------------------------------------------------------------ */
  /* Values                                                                   */
  /* ------------------------------------------------------------------------ */

  public get<T = unknown>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  public set<T = unknown>(key: string, value: T): void {
    this.values.set(key, value);
  }

  public has(key: string): boolean {
    return this.values.has(key);
  }

  public delete(key: string): boolean {
    return this.values.delete(key);
  }

  /* ------------------------------------------------------------------------ */
  /* State Helpers                                                            */
  /* ------------------------------------------------------------------------ */

  public getState<K extends keyof State>(key: K): State[K] {
    return this.state[key];
  }

  public setState<K extends keyof State>(key: K, value: State[K]): void {
    this.state[key] = value;
  }

  public hasState<K extends keyof State>(key: K): boolean {
    return key in this.state;
  }

  /* ------------------------------------------------------------------------ */
  /* Request Helpers                                                          */
  /* ------------------------------------------------------------------------ */

  public get method(): string {
    return this.request.method;
  }

  public get path(): string {
    return this.request.path;
  }

  public get url(): string {
    return this.request.url;
  }

  public get ip(): string | undefined {
    return this.request.ip;
  }

  /* ------------------------------------------------------------------------ */
  /* Response Helpers                                                         */
  /* ------------------------------------------------------------------------ */

  public get statusCode(): number {
    return this.response.statusCode;
  }

  public status(code: number): this {
    this.response.status(code);

    return this;
  }

  public async json<T>(data: T): Promise<void> {
    await this.response.json(data);
  }

  public async send(data?: unknown): Promise<void> {
    await this.response.send(data);
  }

  public async text(data: string): Promise<void> {
    await this.response.text(data);
  }

  public async html(data: string): Promise<void> {
    await this.response.html(data);
  }

  public async redirect(url: string, statusCode?: number): Promise<void> {
    await this.response.redirect(url, statusCode);
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                */
  /* ------------------------------------------------------------------------ */

  public get duration(): number {
    return Date.now() - this.startedAt;
  }

  public get elapsed(): number {
    return this.duration;
  }

  public get aborted(): boolean {
    return this.signal.aborted;
  }

  /* ------------------------------------------------------------------------ */
  /* Logging                                                                  */
  /* ------------------------------------------------------------------------ */

  public log(message: string, metadata?: Record<string, unknown>): void {
    const logger = this.logger as unknown as {
      info?: (message: string, metadata?: Record<string, unknown>) => void;
    };

    logger.info?.(message, metadata);
  }

  /* ------------------------------------------------------------------------ */
  /* Cleanup                                                                  */
  /* ------------------------------------------------------------------------ */

  public clear(): void {
    this.values.clear();
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createHTTPContext<State extends HTTPState = HTTPState>(
  options: HTTPContextOptions<State>,
): DefaultHTTPContext<State> {
  return new DefaultHTTPContext(options);
}

/* -------------------------------------------------------------------------- */
/* Abort Signal                                                               */
/* -------------------------------------------------------------------------- */

function createContextAbortSignal(request: HTTPRequest): AbortSignal {
  const controller = new AbortController();

  if (request.aborted) {
    controller.abort();
  }

  // Listen for future abort events from the underlying request
  if ("on" in request && typeof request.on === "function") {
    const onRequestAbort = (): void => {
      controller.abort();
    };

    request.on("aborted", onRequestAbort);

    // Clean up listener when signal fires
    controller.signal.addEventListener(
      "abort",
      () => {
        // Use any cast since HTTPRequest may not have removeListener
        (
          request as {
            removeListener?: (event: string, listener: () => void) => void;
          }
        )?.removeListener?.("aborted", onRequestAbort);
      },
      { once: true },
    );
  }

  return controller.signal;
}

/* -------------------------------------------------------------------------- */
/* Context Type Guard                                                         */
/* -------------------------------------------------------------------------- */

export function isHTTPContext(value: unknown): value is HTTPContext {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HTTPContext>;

  return (
    candidate.request !== undefined &&
    candidate.response !== undefined &&
    candidate.logger !== undefined &&
    candidate.state !== undefined &&
    typeof candidate.get === "function" &&
    typeof candidate.set === "function"
  );
}
