/**
 * Interceptor registration.
 *
 * @module httpInterceptors/manager/registration
 */

import type {
  InterceptorPhase,
  HttpInterceptorMetadata,
  HttpInterceptorOptions,
  RegisteredHttpInterceptor,
  InternalInterceptor,
} from "../httpInterceptor.type.js";

import { normalizePriority, sanitizeName } from "../httpInterceptor.helper.js";

function generateId(name: string | undefined, size: number): string {
  const base = name ? sanitizeName(name) : "interceptor";
  return `${base}-${size}`;
}

export class InterceptorRegistry<T> {
  private readonly interceptors = new Map<string, InternalInterceptor<T>>();
  private version = 0;

  register(handler: T, options: HttpInterceptorOptions = {}): string {
    const id = generateId(options.name, this.interceptors.size);
    const name = options.name ?? id;
    const phase = options.phase ?? "request";
    const priority = normalizePriority(options.priority ?? "normal");

    const metadata: HttpInterceptorMetadata = {
      id,
      name,
      phase,
      priority,
      enabled: options.enabled ?? true,
      description: options.description,
      tags: options.tags ?? [],
    };

    const interceptor: InternalInterceptor<T> = {
      id,
      metadata,
      handler,
      options,
    };

    this.interceptors.set(id, interceptor);
    this.version++;
    return id;
  }

  unregister(id: string): boolean {
    const existed = this.interceptors.delete(id);
    if (existed) {
      this.version++;
    }
    return existed;
  }

  get(id: string): RegisteredHttpInterceptor<T> | undefined {
    const interceptor = this.interceptors.get(id);
    if (!interceptor) {
      return undefined;
    }
    return {
      metadata: interceptor.metadata,
      handler: interceptor.handler,
      options: interceptor.options,
    };
  }

  has(id: string): boolean {
    return this.interceptors.has(id);
  }

  hasByName(name: string): boolean {
    for (const interceptor of this.interceptors.values()) {
      if (interceptor.metadata.name === name) {
        return true;
      }
    }
    return false;
  }

  clear(): void {
    this.interceptors.clear();
    this.version++;
  }

  get size(): number {
    return this.interceptors.size;
  }

  get version_number(): number {
    return this.version;
  }

  get underlying(): Map<string, InternalInterceptor<T>> {
    return this.interceptors;
  }
}
