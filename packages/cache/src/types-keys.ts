export type CacheKey = string;
export type CacheNamespace = string;

export interface CacheKeyParts {
  readonly namespace?: CacheNamespace;
  readonly key: CacheKey;
}

export interface CacheKeyOptions {
  readonly namespace?: CacheNamespace;
  readonly prefix?: string;
  readonly separator?: string;
}
