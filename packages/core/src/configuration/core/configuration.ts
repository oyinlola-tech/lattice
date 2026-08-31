import type { ContextKey } from "../../context/core/contextKey.key.js";

/** Represents a configuration source. */
export type ConfigurationSource = "default" | "environment" | "file" | "secret" | "remote" | "runtime" | "custom";

/** Configuration value types supported by the core configuration system. */
export type ConfigurationValue = string | number | boolean | null | undefined | ConfigurationValue[] | { readonly [key: string]: ConfigurationValue };

/** Options used to create a Configuration instance. */
export interface ConfigurationOptions {
  readonly values?: Record<string, ConfigurationValue>;
  readonly source?: ConfigurationSource;
  readonly namespace?: string;
}

/** Typed configuration key. */
export interface ConfigurationKey<T> {
  readonly path: string;
  readonly id: symbol;
}

/** Represents a configuration entry. */
export interface ConfigurationEntry<T = ConfigurationValue> {
  readonly path: string;
  readonly value: T;
  readonly source: ConfigurationSource;
}

/** Immutable configuration container. */
export class Configuration {
  private readonly values: Readonly<Record<string, ConfigurationValue>>;
  private readonly source: ConfigurationSource;
  private readonly namespace?: string;

  public constructor(options: ConfigurationOptions = {}) {
    this.source = options.source ?? "runtime";
    this.namespace = options.namespace;
    this.values = Object.freeze({ ...(options.values ?? {}) });
  }

  public getNamespace(): string | undefined { return this.namespace; }
  public getSource(): ConfigurationSource { return this.source; }

  public get<T = ConfigurationValue>(path: string): T | undefined {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) return undefined;
    const parts = normalizedPath.split(".");
    let current: unknown = this.values;
    for (const part of parts) {
      if (typeof current !== "object" || current === null || !(part in current)) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current as T;
  }

  public require<T = ConfigurationValue>(path: string): T {
    const value = this.get<T>(path);
    if (value === undefined) throw new Error(`Required configuration "${path}" is not defined.`);
    return value;
  }

  public getByKey<T>(key: ConfigurationKey<T>): T | undefined { return this.get<T>(key.path); }

  public requireByKey<T>(key: ConfigurationKey<T>): T {
    const value = this.getByKey(key);
    if (value === undefined) throw new Error(`Required configuration "${key.path}" is not defined.`);
    return value;
  }

  public has(path: string): boolean { return this.get(path) !== undefined; }

  public getBoolean(path: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(path);
    if (value === undefined) return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
      if (normalized === "false" || normalized === "0" || normalized === "no") return false;
    }
    throw new TypeError(`Configuration "${path}" is not a valid boolean.`);
  }

  public getNumber(path: string, defaultValue?: number): number | undefined {
    const value = this.get(path);
    if (value === undefined) return defaultValue;
    if (typeof value === "number") {
      if (Number.isFinite(value)) return value;
      throw new TypeError(`Configuration "${path}" must be a finite number.`);
    }
    if (typeof value === "string") {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    throw new TypeError(`Configuration "${path}" is not a valid number.`);
  }

  public getString(path: string, defaultValue?: string): string | undefined {
    const value = this.get(path);
    if (value === undefined) return defaultValue;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    throw new TypeError(`Configuration "${path}" is not a valid string.`);
  }

  public createKey<T>(path: string): ConfigurationKey<T> {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) throw new Error("Configuration key path cannot be empty.");
    return Object.freeze({ path: normalizedPath, id: Symbol(normalizedPath) });
  }

  public scope(namespace: string): Configuration {
    const normalizedNamespace = this.normalizePath(namespace);
    if (!normalizedNamespace) throw new Error("Configuration scope cannot be empty.");
    const scopedValues = this.get<Record<string, ConfigurationValue>>(normalizedNamespace);
    if (scopedValues === undefined || typeof scopedValues !== "object" || scopedValues === null || Array.isArray(scopedValues)) {
      return new Configuration({ values: {}, source: this.source, namespace: normalizedNamespace });
    }
    return new Configuration({ values: scopedValues, source: this.source, namespace: normalizedNamespace });
  }

  public entries(): readonly ConfigurationEntry[] {
    return Object.entries(this.values).map(([path, value]) => ({ path, value, source: this.source }));
  }

  public toObject(): Readonly<Record<string, ConfigurationValue>> { return this.values; }

  public merge(other: Configuration): Configuration {
    return new Configuration({ values: { ...this.values, ...other.toObject() }, source: other.source, namespace: other.namespace ?? this.namespace });
  }

  public with<T extends ConfigurationValue>(path: string, value: T, source: ConfigurationSource = "runtime"): Configuration {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) throw new Error("Configuration path cannot be empty.");
    const values = this.setNestedValue(this.values, normalizedPath, value);
    return new Configuration({ values, source, namespace: this.namespace });
  }

  public without(path: string): Configuration {
    const normalizedPath = this.normalizePath(path);
    if (!normalizedPath) return this;
    const values = this.deleteNestedValue(this.values, normalizedPath);
    return new Configuration({ values, source: this.source, namespace: this.namespace });
  }

  private normalizePath(path: string): string { return path.trim().replace(/\s+/g, ""); }

  private setNestedValue(source: Readonly<Record<string, ConfigurationValue>>, path: string, value: ConfigurationValue): Record<string, ConfigurationValue> {
    const parts = path.split(".");
    if (parts.some((p) => p === "__proto__" || p === "constructor" || p === "prototype")) {
      throw new TypeError(`Invalid configuration path: "${path}"`);
    }
    const result: Record<string, ConfigurationValue> = { ...source };
    let current: Record<string, ConfigurationValue> = result;
    for (let index = 0; index < parts.length - 1; index++) {
      const part = parts[index]!;
      const existing = current[part];
      const nested = existing !== null && typeof existing === "object" && !Array.isArray(existing) ? { ...(existing as Record<string, ConfigurationValue>) } : {};
      current[part] = nested;
      current = nested;
    }
    current[parts[parts.length - 1]!] = value;
    return result;
  }

  private deleteNestedValue(source: Readonly<Record<string, ConfigurationValue>>, path: string): Record<string, ConfigurationValue> {
    const parts = path.split(".");
    if (parts.some((p) => p === "__proto__" || p === "constructor" || p === "prototype")) {
      throw new TypeError(`Invalid configuration path: "${path}"`);
    }
    const result = structuredClone(source) as Record<string, ConfigurationValue>;
    let current: Record<string, ConfigurationValue> = result;
    for (let index = 0; index < parts.length - 1; index++) {
      const part = parts[index]!;
      const next = current[part];
      if (next === null || typeof next !== "object" || Array.isArray(next)) return result;
      current = next as Record<string, ConfigurationValue>;
    }
    delete current[parts[parts.length - 1]!];
    return result;
  }
}

/** Creates an empty Configuration instance. */
export function createConfiguration(options: ConfigurationOptions = {}): Configuration {
  return new Configuration(options);
}
