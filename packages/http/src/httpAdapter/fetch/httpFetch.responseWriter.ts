/**
 * Fetch response writer.
 *
 * @module httpAdapter/fetch/responseWriter
 */

import type { FetchResponseWriter } from "./httpFetch.type.js";

export class FetchHttpResponseWriter implements FetchResponseWriter {
  private _status = 200;
  private _headers: Record<string, string> = {};
  private _body: unknown = undefined;
  private _ended = false;

  status(code: number): FetchResponseWriter {
    this._status = code;
    return this;
  }

  header(name: string, value: string): FetchResponseWriter {
    this._headers[name.toLowerCase()] = value;
    return this;
  }

  async send(body?: unknown): Promise<void> {
    this._body = body ?? this._body;
    this._ended = true;
  }

  async json(data: unknown): Promise<void> {
    this._body = JSON.stringify(data);
    this._headers["content-type"] = "application/json";
    this._ended = true;
  }

  async end(): Promise<void> {
    this._ended = true;
  }

  get status_code(): number {
    return this._status;
  }

  get headers(): Record<string, string> {
    return { ...this._headers };
  }

  get body(): unknown {
    return this._body;
  }

  get ended(): boolean {
    return this._ended;
  }

  toResponse(): Response {
    const body =
      this._body !== undefined
        ? typeof this._body === "string"
          ? this._body
          : JSON.stringify(this._body)
        : undefined;

    return new Response(body, {
      status: this._status,
      headers: this._headers,
    });
  }
}

/**
 * Converts a Response to a context object.
 */
export function responseToContext(response: Response): {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: unknown;
} {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    status: response.status,
    headers,
    body: response.body,
  };
}
