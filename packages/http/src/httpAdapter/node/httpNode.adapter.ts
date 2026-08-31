/**
 * Node.js HTTP adapter.
 *
 * Bridges Node's `http` / `https` server APIs with Lattice's runtime
 * independent HTTP adapter contract.
 *
 * @module httpAdapter/node/adapter
 */

import {
  Server,
  ServerResponse,
  createServer,
} from "node:http";

import {
  HttpRequestContext,
} from "../../httpRequest/httpRequest.context.js";

import {
  HttpResponseContext,
  createResponseContext,
} from "../../httpResponse/httpResponse.context.js";

import type {
  ResponseContextInit,
} from "../../httpResponse/core/httpResponse.type.js";

import {
  BaseHttpAdapter,
} from "../http.adapter.js";

import type {
  HttpHandlerResult,
} from "../http.adapter.js";

import type {
  HttpResponseWriter,
} from "../../httpResponse/httpResponse.writer.js";

import type {
  NodeAdapterOptions,
  NodeServerAddress,
  NodeAdapterEvents,
} from "./httpNode.type.js";

import {
  DEFAULT_HOST,
  DEFAULT_PORT,
  DEFAULT_MAX_BODY_SIZE,
  validatePort,
  validateMaxBodySize,
} from "./httpNode.type.js";

import {
  NodeResponseWriter,
} from "./httpNode.response.js";

import {
  getNodeRequestHeaders,
  getNodeRequestProtocol,
  getNodeRequestHostname,
  getNodeRequestPort,
  getNodeRemoteAddress,
  parseNodeQuery,
  createNodeRequestContext,
} from "./httpNode.request.js";

import {
  isIncomingMessage,
  isServerResponse,
  isNodeRequestResponsePair,
  configureServer,
  listen,
  closeServer,
  isResponseContextLike,
} from "./httpNode.server.js";

/* -------------------------------------------------------------------------- */
/* Node HTTP Adapter                                                          */
/* -------------------------------------------------------------------------- */

export class NodeHttpAdapter
  extends BaseHttpAdapter {
  private readonly host:
    | string;

  private readonly port:
    | number;

  private readonly maxBodySize:
    | number;

  private readonly requestTimeout:
    | number
    | undefined;

  private readonly headersTimeout:
    | number
    | undefined;

  private readonly keepAliveTimeout:
    | number
    | undefined;

  private readonly connectionTimeout:
    | number
    | undefined;

  private readonly trustProxy:
    | boolean
    | number
    | string
    | readonly string[]
    | undefined;

  private readonly events:
    | NodeAdapterEvents;

  private server:
    | Server
    | undefined;

  private ownsServer =
    false;

  constructor(
    options:
      | NodeAdapterOptions = {},
  ) {
    super({
      ...options,
      name:
        options.name ??
        "node",
      capabilities: {
        streaming:
          true,
        websockets:
          false,
        http2:
          false,
        http3:
          false,
        trailers:
          true,
        abortSignal:
          true,
        keepAlive:
          true,
        compression:
          false,
        ...options.capabilities,
      },
    });

    this.host =
      options.host ??
      DEFAULT_HOST;

    this.port =
      validatePort(
        options.port ??
          DEFAULT_PORT,
      );

    this.maxBodySize =
      validateMaxBodySize(
        options.maxBodySize ??
          DEFAULT_MAX_BODY_SIZE,
      );

    this.requestTimeout =
      options.requestTimeout;

    this.headersTimeout =
      options.headersTimeout;

    this.keepAliveTimeout =
      options.keepAliveTimeout;

    this.connectionTimeout =
      options.connectionTimeout;

    this.trustProxy =
      options.trustProxy;

    this.events = {};

    this.server =
      options.server;

    this.ownsServer =
      !options.server;
  }

  /* ------------------------------------------------------------------------ */
  /* Server                                                                   */
  /* ------------------------------------------------------------------------ */

  get httpServer():
    | Server
    | undefined {
    return this.server;
  }

  get address():
    | NodeServerAddress
    | undefined {
    if (
      !this.server
    ) {
      return undefined;
    }

    const address =
      this.server.address();

    if (
      !address ||
      typeof address ===
        "string"
    ) {
      return undefined;
    }

    return {
      host:
        address.address,
      port:
        address.port,
      family:
        typeof address.family ===
        "string"
          ? address.family
          : String(
              address.family,
            ),
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Request / Response                                                       */
  /* ------------------------------------------------------------------------ */

  override createRequest(
    input: unknown,
  ): HttpRequestContext {
    if (
      !isIncomingMessage(
        input,
      )
    ) {
      throw new TypeError(
        "NodeHttpAdapter.createRequest expected an IncomingMessage.",
      );
    }

    return createNodeRequestContext(
      input,
      {
        maxBodySize:
          this.maxBodySize,
        trustProxy:
          this.trustProxy as boolean | string | readonly string[],
      },
    );
  }

  override createResponse(
    input?:
      | unknown,
  ): HttpResponseContext {
    if (
      input !==
        undefined &&
      !isServerResponse(
        input,
      )
    ) {
      throw new TypeError(
        "NodeHttpAdapter.createResponse expected a ServerResponse.",
      );
    }

    return createResponseContext();
  }

  override createWriter(
    response: unknown,
  ): HttpResponseWriter {
    if (
      !isServerResponse(
        response,
      )
    ) {
      throw new TypeError(
        "NodeHttpAdapter.createWriter expected a ServerResponse.",
      );
    }

    return new NodeResponseWriter(
      response,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Handle                                                                   */
  /* ------------------------------------------------------------------------ */

  override async handle(
    input: unknown,
  ): Promise<void> {
    if (
      !isNodeRequestResponsePair(
        input,
      )
    ) {
      throw new TypeError(
        "NodeHttpAdapter.handle expects a Node HTTP request/response pair.",
      );
    }

    const request =
      input.request;

    const response =
      input.response;

    const context =
      this.createRequest(
        request,
      );

    try {
      const result =
        await this.executeNodeHandler(
          context,
        );

      const responseContext =
        this.normalizeResult(
          result,
        );

      await this.writeNodeResponse(
        response,
        responseContext,
      );
    } catch (
      error
    ) {
      await this.handleNodeError(
        error,
        context,
        response,
      );
    }
  }

  private async executeNodeHandler(
    request:
      | HttpRequestContext,
  ): Promise<HttpHandlerResult> {
    if (
      !this.handler
    ) {
      throw new Error(
        "No HTTP handler has been configured.",
      );
    }

    return this.handler(
      request,
    );
  }

  private normalizeResult(
    result:
      | HttpHandlerResult,
  ): HttpResponseContext {
    if (
      result instanceof
      HttpResponseContext
    ) {
      return result;
    }

    if (
      result ===
        undefined ||
      result ===
        null
    ) {
      return createResponseContext();
    }

    if (
      isResponseContextLike(
        result,
      )
    ) {
      return createResponseContext(
        result as ResponseContextInit,
      );
    }

    return createResponseContext().json(
      result,
    );
  }

  private async handleNodeError(
    error: unknown,
    request:
      | HttpRequestContext,
    response:
      | ServerResponse,
  ): Promise<void> {
    if (
      response.headersSent
    ) {
      response.destroy(
        error instanceof
          Error
          ? error
          : undefined,
      );

      return;
    }

    const context =
      createResponseContext();

    if (
      this.errorHandler
    ) {
      try {
        const result =
          await this.errorHandler(
            error,
            request,
          );

        const normalized =
          this.normalizeResult(
            result,
          );

        await this.writeNodeResponse(
          response,
          normalized,
        );

        return;
      } catch {
        // Fall through to the safe internal server error response.
      }
    }

    context
      .internalServerError()
      .json({
        error:
          "Internal Server Error",
      });

    await this.writeNodeResponse(
      response,
      context,
    );
  }

  private async writeNodeResponse(
    response:
      | ServerResponse,
    context:
      | HttpResponseContext,
  ): Promise<void> {
    const writer =
      this.createWriter(
        response,
      );

    await this.writeNodeResponse(
      response,
      context,
    );

    if (
      !response.writableEnded
    ) {
      writer.end();
    }
  }

  override async start(): Promise<void> {
    if (
      this.server?.listening
    ) {
      return;
    }

    if (
      !this.server
    ) {
      this.server =
        createServer(
          (
            request,
            response,
          ) => {
            void this.handle({
              request,
              response,
            });
          },
        );

      this.ownsServer =
        true;
    } else {
      this.server.removeAllListeners(
        "request",
      );

      this.server.on(
        "request",
        (
          request,
          response,
        ) => {
          void this.handle({
            request,
            response,
          });
        },
      );
    }

    configureServer(
      this.server,
      {
        requestTimeout:
          this.requestTimeout,
        headersTimeout:
          this.headersTimeout,
        keepAliveTimeout:
          this.keepAliveTimeout,
        connectionTimeout:
          this.connectionTimeout,
      },
    );

    await listen(
      this.server,
      this.port,
      this.host,
    );

    await super.start();
  }

  override async stop(): Promise<void> {
    if (
      !this.server ||
      !this.server.listening
    ) {
      await super.stop();

      return;
    }

    await closeServer(
      this.server,
    );

    if (
      this.ownsServer
    ) {
      this.server =
        undefined;
    }

    await super.stop();
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createNodeHttpAdapter(
  options:
    | NodeAdapterOptions = {},
): NodeHttpAdapter {
  return new NodeHttpAdapter(
    options,
  );
}
