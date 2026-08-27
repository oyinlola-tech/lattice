import type { RuntimeMode } from "../runtimeOptions/index.js";
import type { RuntimeEnvironmentInfo, RuntimeEnvironment, RuntimeEnvironmentOptions } from "./runtimeEnvironment.type.js";
import { detectRuntimeEngine, detectPlatform, detectProcessInfo, detectHostInfo, readProcessEnvironment, detectCI, detectContainer } from "./detection/index.js";

/**
 * Environment error codes.
 */
export type RuntimeEnvironmentErrorCode =
  | "ENVIRONMENT_VARIABLE_NOT_FOUND"
  | "ENVIRONMENT_INVALID_MODE"
  | "ENVIRONMENT_INVALID_ROLE";

/**
 * Error thrown during environment operations.
 */
export class RuntimeEnvironmentError extends Error {
  public readonly code: RuntimeEnvironmentErrorCode;
  public readonly variableName?: string;

  public constructor(
    message: string,
    code: RuntimeEnvironmentErrorCode,
    variableName?: string,
  ) {
    super(message);
    this.name = "RuntimeEnvironmentError";
    this.code = code;
    this.variableName = variableName;
  }
}

/**
 * Creates a new RuntimeEnvironment.
 */
export function createRuntimeEnvironment(
  options: import("./runtimeEnvironment.type.js").RuntimeEnvironmentOptions,
): import("./runtimeEnvironment.type.js").RuntimeEnvironment {
  return new DefaultRuntimeEnvironment(options);
}

/**
 * Default RuntimeEnvironment implementation.
 */
export class DefaultRuntimeEnvironment
  implements RuntimeEnvironment {
  private readonly _info: RuntimeEnvironmentInfo;

  public constructor(
    options: RuntimeEnvironmentOptions,
  ) {
    const variables = options.variables ?? readProcessEnvironment();
    const engine = detectRuntimeEngine();
    const platform = detectPlatform();
    const processInfo = detectProcessInfo();
    const host = detectHostInfo(platform);
    const isCI = options.isCI ?? detectCI(variables);
    const isContainer = options.isContainer ?? detectContainer(variables);

    this._info = Object.freeze({
      mode: options.mode,
      role: options.role,
      engine,
      host,
      process: processInfo,
      variables: Object.freeze({ ...variables }),
      isCI,
      isContainer,
      isProduction: options.mode === "production",
      isDevelopment: options.mode === "development",
      isTest: options.mode === "test",
    });
  }

  public get info(): RuntimeEnvironmentInfo {
    return this._info;
  }

  public get mode(): RuntimeMode {
    return this._info.mode;
  }

  public get role(): import("../runtimeOptions/index.js").RuntimeRole {
    return this._info.role;
  }

  public get engine(): import("./runtimeEnvironment.type.js").RuntimeEngine {
    return this._info.engine.name;
  }

  public get platform(): import("./runtimeEnvironment.type.js").RuntimePlatform {
    return this._info.host.platform;
  }

  public get(name: string): string | undefined {
    return this._info.variables[name];
  }

  public require(name: string): string {
    const value = this.get(name);

    if (value === undefined || value.length === 0) {
      throw new RuntimeEnvironmentError(
        `Required environment variable "${name}" is not defined.`,
        "ENVIRONMENT_VARIABLE_NOT_FOUND",
        name,
      );
    }

    return value;
  }

  public has(name: string): boolean {
    return this.get(name) !== undefined;
  }

  public isProduction(): boolean {
    return this._info.isProduction;
  }

  public isDevelopment(): boolean {
    return this._info.isDevelopment;
  }

  public isTest(): boolean {
    return this._info.isTest;
  }

  public isCI(): boolean {
    return this._info.isCI;
  }

  public isContainer(): boolean {
    return this._info.isContainer;
  }

  public toJSON(): RuntimeEnvironmentInfo {
    return Object.freeze({
      ...this._info,
      host: Object.freeze({ ...this._info.host }),
      process: Object.freeze({ ...this._info.process }),
      engine: Object.freeze({ ...this._info.engine }),
      variables: Object.freeze({ ...this._info.variables }),
    });
  }
}
