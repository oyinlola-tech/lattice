/**
 * Route pattern types and errors.
 *
 * @module httpRoute/pattern/types
 */

export type RouteSegment =
  StaticRouteSegment | ParameterRouteSegment | WildcardRouteSegment;

export interface StaticRouteSegment {
  readonly type: "static";
  readonly value: string;
}

export interface ParameterRouteSegment {
  readonly type: "parameter";
  readonly name: string;
  readonly optional: boolean;
}

export interface WildcardRouteSegment {
  readonly type: "wildcard";
  readonly name: string;
  readonly optional: boolean;
}

export interface RoutePatternOptions {
  readonly strict?: boolean;
  readonly caseSensitive?: boolean;
  readonly end?: boolean;
}

export interface CompiledRoutePattern {
  readonly original: string;
  readonly segments: readonly RouteSegment[];
  readonly regex: RegExp;
  readonly paramNames: readonly string[];
  readonly options: RoutePatternOptions;
}

export interface RouteMatch {
  readonly params: Record<string, string>;
  readonly path: string;
  readonly pattern: string;
}

import {
  RoutePatternError as BaseRoutePatternError,
  DuplicateRouteParameterError as BaseDuplicateRouteParameterError,
} from "@oyinlola141/lattice-errors";

export {
  BaseRoutePatternError as RoutePatternError,
  BaseDuplicateRouteParameterError as DuplicateRouteParameterError,
};
