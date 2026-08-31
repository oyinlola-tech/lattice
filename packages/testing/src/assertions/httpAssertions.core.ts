/**
 * HTTP assertion helpers.
 *
 * Assert HTTP responses, status codes, headers, and bodies.
 */

import type { HTTPStatusCode } from "../httpTesting/httpStatusCode.type.js";
import type { TestHTTPResponse } from "../httpTesting/httpResponse.type.js";

/**
 * Asserts that a response has a specific status code.
 *
 * @param response - The test response.
 * @param expected - Expected status code.
 */
export function assertResponseStatus(
  response: TestHTTPResponse,
  expected: HTTPStatusCode,
): void {
  if (response.status !== expected) {
    throw new Error(
      `Expected status ${expected}, got ${response.status}.`,
    );
  }
}

/**
 * Asserts that a response has a specific header value.
 *
 * @param response - The test response.
 * @param header - Header name.
 * @param value - Expected header value.
 */
export function assertResponseHeader(
  response: TestHTTPResponse,
  header: string,
  value: string,
): void {
  const actual = response.headers.get(header.toLowerCase());
  if (actual !== value) {
    throw new Error(
      `Expected header "${header}" to be "${value}", got "${actual}".`,
    );
  }
}

/**
 * Asserts that a response body matches expected JSON.
 *
 * @param response - The test response.
 * @param expected - Expected body.
 */
export function assertResponseBody(
  response: TestHTTPResponse,
  expected: unknown,
): void {
  const actual = response.body;
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(
      `Expected body ${expectedJson}, got ${actualJson}.`,
    );
  }
}

/**
 * Asserts that a response is 200 OK.
 */
export function assertOK(response: TestHTTPResponse): void {
  assertResponseStatus(response, 200);
}

/**
 * Asserts that a response is 201 Created.
 */
export function assertCreated(response: TestHTTPResponse): void {
  assertResponseStatus(response, 201);
}

/**
 * Asserts that a response is 204 No Content.
 */
export function assertNoContent(response: TestHTTPResponse): void {
  assertResponseStatus(response, 204);
}

/**
 * Asserts that a response is 400 Bad Request.
 */
export function assertBadRequest(response: TestHTTPResponse): void {
  assertResponseStatus(response, 400);
}

/**
 * Asserts that a response is 404 Not Found.
 */
export function assertNotFound(response: TestHTTPResponse): void {
  assertResponseStatus(response, 404);
}

/**
 * Asserts that a response is 500 Internal Server Error.
 */
export function assertServerError(response: TestHTTPResponse): void {
  assertResponseStatus(response, 500);
}
