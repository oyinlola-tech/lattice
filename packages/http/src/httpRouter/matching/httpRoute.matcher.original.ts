/**
 * Lattice HTTP route matcher.
 *
 * Responsible only for selecting and matching registered routes against an
 * incoming HTTP method and pathname.
 *
 * Route registration lives in route-registry.ts.
 * Route indexing lives in route-tree.ts.
 * Route pattern parsing lives in route-pattern.ts.
 */

import type { HttpMethod, MatchedRoute } from "../core/httpRouter.type.js";

import type {
  RouteRegistry,
  RouteRegistryEntry,
} from "./httpRoute.registry.js";

import type { RouteTree, RouteTreeMatch } from "./httpRoute.tree.js";

import type { CompiledRoutePattern, RouteMatch } from "./httpRoute.pattern.js";

import { compileRoutePattern } from "./httpRoute.pattern.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RouteMatcherOptions {
  readonly caseSensitive?: boolean;

  readonly strictTrailingSlash?: boolean;

  readonly allowHeadFallback?: boolean;

  readonly allowOptionsFallback?: boolean;
}

export interface RouteMatchRequest {
  readonly method: string;

  readonly path: string;
}

export interface RouteMatcherResult {
  readonly route: MatchedRoute;

  readonly entry: RouteRegistryEntry;

  readonly params: Readonly<Record<string, string>>;

  readonly method: HttpMethod | "*";

  readonly path: string;

  readonly score: number;

  readonly matchedBy:
    "exact" | "head-fallback" | "options-fallback" | "wildcard";
}

export interface RouteMethodResult {
  readonly allowed: boolean;

  readonly methods: readonly (HttpMethod | "*")[];

  readonly allowHeader: string;
}

export interface RouteMatcherStats {
  readonly routes: number;

  readonly requests: number;

  readonly matches: number;

  readonly misses: number;
}

/* -------------------------------------------------------------------------- */
/* Route Matcher                                                              */
/* -------------------------------------------------------------------------- */

export class RouteMatcher {
  private readonly registry: RouteRegistry;

  private readonly tree: RouteTree;

  private readonly options: Required<RouteMatcherOptions>;

  private requests = 0;

  private matches = 0;

  private misses = 0;

  constructor(
    registry: RouteRegistry,
    tree: RouteTree,
    options: RouteMatcherOptions = {},
  ) {
    this.registry = registry;

    this.tree = tree;

    this.options = {
      caseSensitive: options.caseSensitive ?? false,

      strictTrailingSlash: options.strictTrailingSlash ?? false,

      allowHeadFallback: options.allowHeadFallback ?? true,

      allowOptionsFallback: options.allowOptionsFallback ?? true,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Primary Matching                                                         */
  /* ------------------------------------------------------------------------ */

  match(request: RouteMatchRequest): RouteMatcherResult | undefined {
    this.requests += 1;

    const method = normalizeMethod(request.method);

    const path = normalizeRequestPath(request.path);

    const direct = this.matchMethod(method, path);

    if (direct) {
      this.matches += 1;

      return direct;
    }

    if (method === "HEAD" && this.options.allowHeadFallback) {
      const fallback = this.matchMethod("GET", path);

      if (fallback) {
        this.matches += 1;

        return {
          ...fallback,

          matchedBy: "head-fallback",
        };
      }
    }

    if (method === "OPTIONS" && this.options.allowOptionsFallback) {
      const methods = this.allowedMethods(path);

      if (methods.methods.length > 0) {
        const first = this.matchFirstAllowed(methods.methods, path);

        if (first) {
          this.matches += 1;

          return {
            ...first,

            matchedBy: "options-fallback",
          };
        }
      }
    }

    this.misses += 1;

    return undefined;
  }

  matchMethod(
    method: string | HttpMethod | "*",
    path: string,
  ): RouteMatcherResult | undefined {
    const normalizedMethod = normalizeMethod(method);

    const normalizedPath = normalizeRequestPath(path);

    const treeMatch = this.tree.match(normalizedPath, normalizedMethod);

    if (treeMatch) {
      return createResult(treeMatch, normalizedMethod, normalizedPath, "exact");
    }

    return this.matchRegistry(normalizedMethod, normalizedPath);
  }

  /* ------------------------------------------------------------------------ */
  /* All Matches                                                              */
  /* ------------------------------------------------------------------------ */

  matchAll(request: RouteMatchRequest): readonly RouteMatcherResult[] {
    const method = normalizeMethod(request.method);

    const path = normalizeRequestPath(request.path);

    const treeMatches = this.tree.matchAll(path, method);

    const results = treeMatches.map((match) =>
      createResult(match, method, path, "exact"),
    );

    return Object.freeze(deduplicateResults(results));
  }

  /* ------------------------------------------------------------------------ */
  /* Path Matching                                                            */
  /* ------------------------------------------------------------------------ */

  matchPath(path: string): readonly RouteMatcherResult[] {
    const normalizedPath = normalizeRequestPath(path);

    const candidates = this.tree.matchAll(normalizedPath, "*");

    return Object.freeze(
      candidates.map((match) =>
        createResult(match, "*", normalizedPath, "wildcard"),
      ),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Allowed Methods                                                          */
  /* ------------------------------------------------------------------------ */

  allowedMethods(path: string): RouteMethodResult {
    const normalizedPath = normalizeRequestPath(path);

    const candidates = this.tree.candidates(normalizedPath);

    const methods: Set<HttpMethod | "*"> = new Set();

    for (const candidate of candidates) {
      if (candidate.pattern.test(normalizedPath)) {
        methods.add(candidate.route.method);
      }
    }

    const ordered = orderMethods(methods);

    return Object.freeze({
      allowed: ordered.length > 0,

      methods: Object.freeze(ordered),

      allowHeader: ordered.join(", "),
    });
  }

  isAllowed(method: string, path: string): boolean {
    const normalizedMethod = normalizeMethod(method);

    const allowed = this.allowedMethods(path);

    if (allowed.methods.includes("*")) {
      return true;
    }

    if (allowed.methods.includes(normalizedMethod)) {
      return true;
    }

    return normalizedMethod === "HEAD" && allowed.methods.includes("GET");
  }

  /* ------------------------------------------------------------------------ */
  /* Direct Route Matching                                                    */
  /* ------------------------------------------------------------------------ */

  matchRoute(route: MatchedRoute, path: string): RouteMatch | undefined {
    const normalizedPath = normalizeRequestPath(path);

    const compiled = compileRoutePattern(route.path, {
      caseSensitive: this.options.caseSensitive,

      strictTrailingSlash: this.options.strictTrailingSlash,
    });

    return compiled.match(normalizedPath);
  }

  matchPattern(
    pattern: string | CompiledRoutePattern,
    path: string,
  ): RouteMatch | undefined {
    const compiled =
      typeof pattern === "string"
        ? compileRoutePattern(pattern, {
            caseSensitive: this.options.caseSensitive,

            strictTrailingSlash: this.options.strictTrailingSlash,
          })
        : pattern;

    return compiled.match(normalizeRequestPath(path));
  }

  /* ------------------------------------------------------------------------ */
  /* Registry Fallback                                                        */
  /* ------------------------------------------------------------------------ */

  private matchRegistry(
    method: HttpMethod | "*",
    path: string,
  ): RouteMatcherResult | undefined {
    const candidates = this.registry.find({
      method,
    });

    let best: RouteRegistryEntry | undefined;

    let bestMatch: RouteMatch | undefined;

    for (const candidate of candidates) {
      const match = candidate.pattern.match(path);

      if (!match) {
        continue;
      }

      if (
        !best ||
        candidate.pattern.score > (bestMatch ? best.pattern.score : -Infinity)
      ) {
        best = candidate;

        bestMatch = match;
      }
    }

    if (!best || !bestMatch) {
      return undefined;
    }

    return {
      route: best.route,

      entry: best,

      params: bestMatch.params,

      method: best.route.method,

      path,

      score: best.pattern.score,

      matchedBy: "exact",
    };
  }

  private matchFirstAllowed(
    methods: readonly (HttpMethod | "*")[],
    path: string,
  ): RouteMatcherResult | undefined {
    for (const method of methods) {
      const result = this.matchMethod(method, path);

      if (result) {
        return result;
      }
    }

    return undefined;
  }

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  stats(): RouteMatcherStats {
    return Object.freeze({
      routes: this.registry.count(),

      requests: this.requests,

      matches: this.matches,

      misses: this.misses,
    });
  }

  resetStats(): void {
    this.requests = 0;

    this.matches = 0;

    this.misses = 0;
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createRouteMatcher(
  registry: RouteRegistry,
  tree: RouteTree,
  options: RouteMatcherOptions = {},
): RouteMatcher {
  return new RouteMatcher(registry, tree, options);
}

/* -------------------------------------------------------------------------- */
/* Standalone Helpers                                                         */
/* -------------------------------------------------------------------------- */

export function matchRoute(
  matcher: RouteMatcher,
  method: string,
  path: string,
): RouteMatcherResult | undefined {
  return matcher.match({
    method,
    path,
  });
}

export function matchRoutePath(
  matcher: RouteMatcher,
  path: string,
): readonly RouteMatcherResult[] {
  return matcher.matchPath(path);
}

export function getAllowedMethods(
  matcher: RouteMatcher,
  path: string,
): RouteMethodResult {
  return matcher.allowedMethods(path);
}

/* -------------------------------------------------------------------------- */
/* Result Creation                                                            */
/* -------------------------------------------------------------------------- */

function createResult(
  match: RouteTreeMatch,
  method: HttpMethod | "*",
  path: string,
  matchedBy: RouteMatcherResult["matchedBy"],
): RouteMatcherResult {
  return Object.freeze({
    route: match.route.route,

    entry: match.route,

    params: Object.freeze({
      ...match.params,
    }),

    method,

    path,

    score: match.score,

    matchedBy,
  });
}

/* -------------------------------------------------------------------------- */
/* Method Utilities                                                           */
/* -------------------------------------------------------------------------- */

function normalizeMethod(method: string): HttpMethod | "*" {
  const normalized = method.trim().toUpperCase();

  if (normalized === "*") {
    return "*";
  }

  if (!isHttpMethod(normalized)) {
    throw new Error(`Unsupported HTTP method "${method}".`);
  }

  return normalized;
}

function isHttpMethod(value: string): value is HttpMethod {
  return (
    value === "GET" ||
    value === "HEAD" ||
    value === "POST" ||
    value === "PUT" ||
    value === "PATCH" ||
    value === "DELETE" ||
    value === "OPTIONS" ||
    value === "CONNECT" ||
    value === "TRACE"
  );
}

function orderMethods(methods: Set<HttpMethod | "*">): (HttpMethod | "*")[] {
  const preferred: (HttpMethod | "*")[] = [
    "OPTIONS",
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "CONNECT",
    "TRACE",
    "*",
  ];

  return preferred.filter((method) => methods.has(method));
}

/* -------------------------------------------------------------------------- */
/* Path Utilities                                                             */
/* -------------------------------------------------------------------------- */

export function normalizeRequestPath(path: string): string {
  if (!path) {
    return "/";
  }

  let normalized = path.trim();

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      normalized = new URL(normalized).pathname;
    } catch {
      // Keep the original value if it is not a valid absolute URL.
    }
  }

  const queryIndex = normalized.indexOf("?");

  if (queryIndex !== -1) {
    normalized = normalized.slice(0, queryIndex);
  }

  const hashIndex = normalized.indexOf("#");

  if (hashIndex !== -1) {
    normalized = normalized.slice(0, hashIndex);
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

/* -------------------------------------------------------------------------- */
/* Result Deduplication                                                       */
/* -------------------------------------------------------------------------- */

function deduplicateResults(
  results: readonly RouteMatcherResult[],
): RouteMatcherResult[] {
  const seen = new Set<string>();

  const output: RouteMatcherResult[] = [];

  for (const result of results) {
    const id = result.route.id;

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    output.push(result);
  }

  return output;
}

/* -------------------------------------------------------------------------- */
/* Type Guards                                                                */
/* -------------------------------------------------------------------------- */

export function isRouteMatcher(value: unknown): value is RouteMatcher {
  return value instanceof RouteMatcher;
}

export function isRouteMatcherResult(
  value: unknown,
): value is RouteMatcherResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "route" in value &&
    "params" in value &&
    "method" in value &&
    "path" in value
  );
}
