/**
 * HTTP client response parsing.
 *
 * @module httpClient/response
 */

import type {
  HttpResponseType,
  HttpClientResponse,
} from "./httpClient.type.js";

import { HttpClientError } from "./httpClient.error.js";

import { getDefaultBaseUrl } from "./httpClient.helpers.js";

export async function parseResponse(
  response: Response,
  responseType: HttpResponseType = "auto",
): Promise<HttpClientResponse> {
  const type = resolveResponseType(response, responseType);
  let data: unknown;

  switch (type) {
    case "json":
      data = await parseJsonResponse(response);
      break;
    case "text":
      data = await response.text();
      break;
    case "arrayBuffer":
      data = await response.arrayBuffer();
      break;
    case "blob":
      data = await response.blob();
      break;
    case "response":
      data = response;
      break;
    default:
      data = await response.text();
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.url,
    request: createRequestFromResponse(response),
    raw: response,
    ok: response.ok,
  };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.trim() === "") {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new HttpClientError("Failed to parse HTTP response as JSON.", {
      code: "HTTP_CLIENT_INVALID_JSON",
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      cause: error,
    });
  }
}

function resolveResponseType(
  response: Response,
  requested: HttpResponseType,
): HttpResponseType {
  if (requested !== "auto") {
    return requested;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (
    contentType.toLowerCase().includes("application/json") ||
    contentType.toLowerCase().includes("+json")
  ) {
    return "json";
  }

  if (contentType.toLowerCase().startsWith("text/")) {
    return "text";
  }

  return "response";
}

function createRequestFromResponse(response: Response): Request {
  return new Request(response.url || getDefaultBaseUrl(), {
    method: "GET",
  });
}
