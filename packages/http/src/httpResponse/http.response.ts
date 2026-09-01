import type { ServerResponse } from "node:http";

import {
  HTTP_CONTENT_TYPES,
  HTTP_HEADERS,
  HTTP_STATUS,
} from "../httpConstants/http.constants.js";

import type { HTTPResponse, HTTPStatusCode } from "../httpTypes/http.types.js";

/* -------------------------------------------------------------------------- */
/* Response Options                                                           */
/* -------------------------------------------------------------------------- */

export interface HTTPResponseOptions {
  readonly defaultStatusCode?: HTTPStatusCode;
}

/* -------------------------------------------------------------------------- */
/* Node HTTP Response                                                         */
/* -------------------------------------------------------------------------- */

export class NodeHTTPResponse implements HTTPResponse {
  private readonly response: ServerResponse;

  private readonly defaultStatusCode: HTTPStatusCode;

  public statusCode: HTTPStatusCode;

  public constructor(
    response: ServerResponse,
    options: HTTPResponseOptions = {},
  ) {
    this.response = response;

    this.defaultStatusCode = options.defaultStatusCode ?? HTTP_STATUS.OK;

    this.statusCode = this.defaultStatusCode;
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  public get headersSent(): boolean {
    return this.response.headersSent;
  }

  public get finished(): boolean {
    return this.response.writableFinished;
  }

  /* ------------------------------------------------------------------------ */
  /* Headers                                                                  */
  /* ------------------------------------------------------------------------ */

  public setHeader(name: string, value: string | readonly string[]): this {
    this.assertMutable();

    this.response.setHeader(name, value as string | string[]);

    return this;
  }

  public getHeader(name: string): string | string[] | undefined {
    const value = this.response.getHeader(name);

    if (Array.isArray(value)) {
      return value.map(String);
    }

    if (value === undefined) {
      return undefined;
    }

    return String(value);
  }

  public removeHeader(name: string): this {
    this.assertMutable();

    this.response.removeHeader(name);

    return this;
  }

  public set(name: string, value: string | readonly string[]): this {
    return this.setHeader(name, value);
  }

  public header(name: string, value: string | readonly string[]): this {
    return this.setHeader(name, value);
  }

  /* ------------------------------------------------------------------------ */
  /* Status                                                                   */
  /* ------------------------------------------------------------------------ */

  public status(code: HTTPStatusCode): this {
    this.assertMutable();

    if (!Number.isInteger(code) || code < 100 || code > 999) {
      throw new RangeError(`Invalid HTTP status code: ${code}`);
    }

    this.statusCode = code;

    this.response.statusCode = code;

    return this;
  }

  /* ------------------------------------------------------------------------ */
  /* Content Type                                                              */
  /* ------------------------------------------------------------------------ */

  public type(contentType: string): this {
    this.setHeader(HTTP_HEADERS.CONTENT_TYPE, contentType);

    return this;
  }

  /* ------------------------------------------------------------------------ */
  /* JSON                                                                     */
  /* ------------------------------------------------------------------------ */

  public async json<T = unknown>(data: T): Promise<void> {
    this.assertMutable();

    const body = JSON.stringify(data);

    if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_TYPE)) {
      this.response.setHeader(
        HTTP_HEADERS.CONTENT_TYPE,
        HTTP_CONTENT_TYPES.JSON_UTF8,
      );
    }

    this.response.setHeader(
      HTTP_HEADERS.CONTENT_LENGTH,
      Buffer.byteLength(body, "utf8"),
    );

    await this.writeBody(body);
  }

  /* ------------------------------------------------------------------------ */
  /* Generic Send                                                              */
  /* ------------------------------------------------------------------------ */

  public async send(body?: unknown): Promise<void> {
    this.assertMutable();

    if (body === undefined || body === null) {
      await this.end();

      return;
    }

    if (typeof body === "string") {
      if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_TYPE)) {
        this.response.setHeader(
          HTTP_HEADERS.CONTENT_TYPE,
          HTTP_CONTENT_TYPES.TEXT_UTF8,
        );
      }

      await this.writeBody(body);

      return;
    }

    if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
      if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_TYPE)) {
        this.response.setHeader(
          HTTP_HEADERS.CONTENT_TYPE,
          HTTP_CONTENT_TYPES.OCTET_STREAM,
        );
      }

      await this.writeBody(Buffer.from(body));

      return;
    }

    await this.json(body);
  }

  /* ------------------------------------------------------------------------ */
  /* Text                                                                     */
  /* ------------------------------------------------------------------------ */

  public async text(body: string): Promise<void> {
    this.assertMutable();

    if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_TYPE)) {
      this.response.setHeader(
        HTTP_HEADERS.CONTENT_TYPE,
        HTTP_CONTENT_TYPES.TEXT_UTF8,
      );
    }

    await this.writeBody(body);
  }

  /* ------------------------------------------------------------------------ */
  /* HTML                                                                     */
  /* ------------------------------------------------------------------------ */

  public async html(body: string): Promise<void> {
    this.assertMutable();

    if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_TYPE)) {
      this.response.setHeader(
        HTTP_HEADERS.CONTENT_TYPE,
        HTTP_CONTENT_TYPES.HTML_UTF8,
      );
    }

    await this.writeBody(body);
  }

  /* ------------------------------------------------------------------------ */
  /* Redirect                                                                 */
  /* ------------------------------------------------------------------------ */

  public async redirect(
    url: string,
    statusCode: HTTPStatusCode | undefined = HTTP_STATUS.FOUND,
  ): Promise<void> {
    this.assertMutable();

    this.status(statusCode);

    this.setHeader(HTTP_HEADERS.LOCATION, url);

    await this.end();
  }

  /* ------------------------------------------------------------------------ */
  /* End                                                                      */
  /* ------------------------------------------------------------------------ */

  public async end(body?: Uint8Array): Promise<void> {
    this.assertMutable();

    if (body && body.byteLength > 0) {
      await this.writeBody(Buffer.from(body));

      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.response.end(() => resolve());

      this.response.once("error", reject);
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Internal Write                                                           */
  /* ------------------------------------------------------------------------ */

  private async writeBody(body: string | Uint8Array): Promise<void> {
    this.assertMutable();

    const buffer =
      typeof body === "string" ? Buffer.from(body, "utf8") : Buffer.from(body);

    if (!this.response.hasHeader(HTTP_HEADERS.CONTENT_LENGTH)) {
      this.response.setHeader(HTTP_HEADERS.CONTENT_LENGTH, buffer.byteLength);
    }

    await new Promise<void>((resolve, reject) => {
      this.response.end(buffer, () => resolve());

      this.response.once("error", reject);
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  private assertMutable(): void {
    if (this.response.headersSent || this.response.writableEnded) {
      throw new Error("HTTP response has already been sent.");
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createHTTPResponse(
  response: ServerResponse,
  options: HTTPResponseOptions = {},
): NodeHTTPResponse {
  return new NodeHTTPResponse(response, options);
}

/* -------------------------------------------------------------------------- */
/* Response Helpers                                                           */
/* -------------------------------------------------------------------------- */

export async function sendJSON(
  response: HTTPResponse,
  data: unknown,
  statusCode?: HTTPStatusCode,
): Promise<void> {
  if (statusCode !== undefined) {
    response.status(statusCode);
  }

  await response.json(data);
}

export async function sendText(
  response: HTTPResponse,
  body: string,
  statusCode?: HTTPStatusCode,
): Promise<void> {
  if (statusCode !== undefined) {
    response.status(statusCode);
  }

  await response.text(body);
}

export async function sendHTML(
  response: HTTPResponse,
  body: string,
  statusCode?: HTTPStatusCode,
): Promise<void> {
  if (statusCode !== undefined) {
    response.status(statusCode);
  }

  await response.html(body);
}

export async function redirect(
  response: HTTPResponse,
  url: string,
  statusCode: HTTPStatusCode | undefined = HTTP_STATUS.FOUND,
): Promise<void> {
  await response.redirect(url, statusCode);
}
