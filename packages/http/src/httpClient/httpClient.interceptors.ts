/**
 * HTTP client interceptor management.
 *
 * @module httpClient/interceptors
 */

import type {
  HttpRequestInterceptor,
  HttpResponseInterceptor,
  HttpErrorInterceptor,
} from "./httpClient.type.js";

import { removeInterceptor } from "./httpClient.helpers.js";

export function addRequestInterceptor(
  list: HttpRequestInterceptor[],
  interceptor: HttpRequestInterceptor,
): () => void {
  list.push(interceptor);
  return () => {
    removeInterceptor(list, interceptor);
  };
}

export function addResponseInterceptor(
  list: HttpResponseInterceptor[],
  interceptor: HttpResponseInterceptor,
): () => void {
  list.push(interceptor);
  return () => {
    removeInterceptor(list, interceptor);
  };
}

export function addErrorInterceptor(
  list: HttpErrorInterceptor[],
  interceptor: HttpErrorInterceptor,
): () => void {
  list.push(interceptor);
  return () => {
    removeInterceptor(list, interceptor);
  };
}
