import type {
  RuntimeMode,
  RuntimeRole,
} from "./runtime-options.js";

/**
 * Supported operating system platforms.
 */
export type RuntimePlatform =
  | "linux"
  | "darwin"
  | "win32"
  | "freebsd"
  | "openbsd"
  | "android"
  | "other";

/**
 * Supported JavaScript runtime types.
 */
export type RuntimeEngine =
  | "node"
  | "bun"
  | "deno"
  | "browser"
  | "unknown";

/**
 * Runtime environment variables.
 *
 * Values are intentionally represented as strings because
 * environment variables are fundamentally string based.
 */
export type RuntimeEnvironmentVariables =
  Readonly<
    Record<string, string | undefined>
  >;

/**
 * Basic process information.
 */
export interface RuntimeProcessInfo {
  /**
   * Process ID.
   */
  readonly pid?: number;

  /**
   * Parent process ID.
   */
  readonly ppid?: number;

  /**
   * Current working directory.
   */
  readonly cwd?: string;

  /**
   * Executable path.
   */
  readonly execPath?: string;

  /**
   * Process architecture.
   */
  readonly arch?: string;

  /**
   * Process version.
   */
  readonly version?: string;
}

/**
 * Runtime host information.
 */
export interface RuntimeHostInfo {
  /**
   * Operating system platform.
   */
  readonly platform:
    RuntimePlatform;

  /**
   * CPU architecture.
   */
  readonly architecture:
    string;

  /**
   * Hostname when available.
   */
  readonly hostname?:
    string;

  /**
   * Number of logical CPUs when available.
   */
  readonly cpuCount?:
    number;
}

/**
 * Runtime engine information.
 */
export interface RuntimeEngineInfo {
  /**
   * Runtime engine.
   */
  readonly name:
    RuntimeEngine;

  /**
   * Runtime version.
   */
  readonly version?:
    string;

  /**
   * Whether the runtime supports Node-compatible APIs.
   */
  readonly nodeCompatible:
    boolean;
}

/**
 * Complete runtime environment information.
 */
export interface RuntimeEnvironmentInfo {
  /**
   * Application execution mode.
   */
  readonly mode:
    RuntimeMode;

  /**
   * Runtime role.
   */
  readonly role:
    RuntimeRole;

  /**
   * Runtime engine information.
   */
  readonly engine:
    RuntimeEngineInfo;

  /**
   * Host information.
   */
  readonly host:
    RuntimeHostInfo;

  /**
   * Process information.
   */
  readonly process:
    RuntimeProcessInfo;

  /**
   * Environment variables.
   */
  readonly variables:
    RuntimeEnvironmentVariables;

  /**
   * Whether the process is running in a CI environment.
   */
  readonly isCI:
    boolean;

  /**
   * Whether the process is running in a container.
   */
  readonly isContainer:
    boolean;

  /**
   * Whether the environment is considered production.
   */
  readonly isProduction:
    boolean;

  /**
   * Whether the environment is considered development.
   */
  readonly isDevelopment:
    boolean;

  /**
   * Whether the environment is considered a test environment.
   */
  readonly isTest:
    boolean;
}

/**
 * Runtime environment contract.
 */
export interface RuntimeEnvironment {
  /**
   * Runtime environment information.
   */
  readonly info:
    RuntimeEnvironmentInfo;

  /**
   * Runtime mode.
   */
  readonly mode:
    RuntimeMode;

  /**
   * Runtime role.
   */
  readonly role:
    RuntimeRole;

  /**
   * Runtime engine.
   */
  readonly engine:
    RuntimeEngine;

  /**
   * Operating system platform.
   */
  readonly platform:
    RuntimePlatform;

  /**
   * Returns an environment variable.
   */
  get(
    name: string,
  ):
    string | undefined;

  /**
   * Returns an environment variable or throws
   * when it does not exist.
   */
  require(
    name: string,
  ):
    string;

  /**
   * Checks whether an environment variable exists.
   */
  has(
    name: string,
  ):
    boolean;

  /**
   * Returns whether this is production.
   */
  isProduction():
    boolean;

  /**
   * Returns whether this is development.
   */
  isDevelopment():
    boolean;

  /**
   * Returns whether this is a test environment.
   */
  isTest():
    boolean;

  /**
   * Returns whether this is a CI environment.
   */
  isCI():
    boolean;

  /**
   * Returns whether this is a container.
   */
  isContainer():
    boolean;

  /**
   * Returns a safe snapshot of the environment.
   *
   * Sensitive environment variables should not be exposed
   * directly through this method.
   */
  toJSON():
    RuntimeEnvironmentInfo;
}

/**
 * Options used to create a RuntimeEnvironment.
 */
export interface RuntimeEnvironmentOptions {
  /**
   * Runtime mode.
   */
  readonly mode:
    RuntimeMode;

  /**
   * Runtime role.
   */
  readonly role:
    RuntimeRole;

  /**
   * Optional environment variable source.
   *
   * If omitted, process.env is used when available.
   */
  readonly variables?:
    RuntimeEnvironmentVariables;

  /**
   * Optional explicit CI detection.
   */
  readonly isCI?:
    boolean;

  /**
   * Optional explicit container detection.
   */
  readonly isContainer?:
    boolean;
}

/**
 * Default RuntimeEnvironment implementation.
 */
export class DefaultRuntimeEnvironment
  implements RuntimeEnvironment {
  private readonly _info:
    RuntimeEnvironmentInfo;

  public constructor(
    options:
      RuntimeEnvironmentOptions,
  ) {
    const variables =
      options.variables ??
      readProcessEnvironment();

    const engine =
      detectRuntimeEngine();

    const platform =
      detectPlatform();

    const processInfo =
      detectProcessInfo();

    const host =
      detectHostInfo(
        platform,
      );

    const isCI =
      options.isCI ??
      detectCI(
        variables,
      );

    const isContainer =
      options.isContainer ??
      detectContainer(
        variables,
      );

    this._info =
      Object.freeze({
        mode:
          options.mode,

        role:
          options.role,

        engine,

        host,

        process:
          processInfo,

        variables:
          Object.freeze({
            ...variables,
          }),

        isCI,

        isContainer,

        isProduction:
          options.mode ===
          "production",

        isDevelopment:
          options.mode ===
          "development",

        isTest:
          options.mode ===
          "test",
      });
  }

  /**
   * Complete environment information.
   */
  public get info():
    RuntimeEnvironmentInfo {
    return this._info;
  }

  /**
   * Runtime mode.
   */
  public get mode():
    RuntimeMode {
    return this._info.mode;
  }

  /**
   * Runtime role.
   */
  public get role():
    RuntimeRole {
    return this._info.role;
  }

  /**
   * Runtime engine.
   */
  public get engine():
    RuntimeEngine {
    return this._info.engine.name;
  }

  /**
   * Operating system platform.
   */
  public get platform():
    RuntimePlatform {
    return this._info.host.platform;
  }

  /**
   * Gets an environment variable.
   */
  public get(
    name: string,
  ):
    string | undefined {
    return this._info.variables[
      name
    ];
  }

  /**
   * Gets a required environment variable.
   */
  public require(
    name: string,
  ):
    string {
    const value =
      this.get(name);

    if (
      value === undefined ||
      value.length === 0
    ) {
      throw new RuntimeEnvironmentError(
        `Required environment variable "${name}" is not defined.`,
        name,
      );
    }

    return value;
  }

  /**
   * Checks whether an environment variable exists.
   */
  public has(
    name: string,
  ):
    boolean {
    return (
      this.get(name) !==
      undefined
    );
  }

  /**
   * Returns whether this is production.
   */
  public isProduction():
    boolean {
    return this._info
      .isProduction;
  }

  /**
   * Returns whether this is development.
   */
  public isDevelopment():
    boolean {
    return this._info
      .isDevelopment;
  }

  /**
   * Returns whether this is a test environment.
   */
  public isTest():
    boolean {
    return this._info
      .isTest;
  }

  /**
   * Returns whether this is CI.
   */
  public isCI():
    boolean {
    return this._info
      .isCI;
  }

  /**
   * Returns whether this is running inside a container.
   */
  public isContainer():
    boolean {
    return this._info
      .isContainer;
  }

  /**
   * Returns a serializable environment snapshot.
   */
  public toJSON():
    RuntimeEnvironmentInfo {
    return Object.freeze({
      ...this._info,

      host:
        Object.freeze({
          ...this._info.host,
        }),

      process:
        Object.freeze({
          ...this._info.process,
        }),

      engine:
        Object.freeze({
          ...this._info.engine,
        }),

      variables:
        Object.freeze({
          ...this._info.variables,
        }),
    });
  }
}

/**
 * Creates a runtime environment.
 */
export function createRuntimeEnvironment(
  options:
    RuntimeEnvironmentOptions,
): RuntimeEnvironment {
  return new DefaultRuntimeEnvironment(
    options,
  );
}

/**
 * Detects the JavaScript runtime.
 */
export function detectRuntimeEngine():
  RuntimeEngineInfo {
  const globalObject =
    globalThis as {
      process?: {
        versions?: {
          node?: string;
          bun?: string;
        };
        version?: string;
      };

      Bun?: {
        version?:
          string;
      };

      Deno?: {
        version?:
          Readonly<{
            deno?: string;
          }>;
      };

      window?: unknown;
    };

  if (
    globalObject.Bun
  ) {
    return Object.freeze({
      name:
        "bun",

      version:
        globalObject.Bun
          .version,

      nodeCompatible:
        true,
    });
  }

  if (
    globalObject.Deno
  ) {
    return Object.freeze({
      name:
        "deno",

      version:
        globalObject.Deno
          .version
          ?.deno,

      nodeCompatible:
        false,
    });
  }

  if (
    globalObject.process
      ?.versions
      ?.node
  ) {
    return Object.freeze({
      name:
        "node",

      version:
        globalObject.process
          .versions
          .node,

      nodeCompatible:
        true,
    });
  }

  if (
    typeof globalObject.window !==
    "undefined"
  ) {
    return Object.freeze({
      name:
        "browser",

      nodeCompatible:
        false,
    });
  }

  return Object.freeze({
    name:
      "unknown",

    nodeCompatible:
      false,
  });
}

/**
 * Detects the host operating system.
 */
export function detectPlatform():
  RuntimePlatform {
  const processObject =
    getProcessObject();

  const platform =
    processObject?.platform;

  switch (platform) {
    case "linux":
      return "linux";

    case "darwin":
      return "darwin";

    case "win32":
      return "win32";

    case "freebsd":
      return "freebsd";

    case "openbsd":
      return "openbsd";

    case "android":
      return "android";

    default:
      return "other";
  }
}

/**
 * Detects process information.
 */
export function detectProcessInfo():
  RuntimeProcessInfo {
  const processObject =
    getProcessObject();

  if (!processObject) {
    return Object.freeze({});
  }

  return Object.freeze({
    pid:
      processObject.pid,

    ppid:
      processObject.ppid,

    cwd:
      safeCall(
        processObject.cwd,
      ),

    execPath:
      processObject.execPath,

    arch:
      processObject.arch,

    version:
      processObject.version,
  });
}

/**
 * Detects host information.
 */
export function detectHostInfo(
  platform:
    RuntimePlatform,
): RuntimeHostInfo {
  const processObject =
    getProcessObject();

  const osObject =
    getNodeOsObject();

  return Object.freeze({
    platform,

    architecture:
      processObject?.arch ??
      "unknown",

    hostname:
      safeCall(
        osObject?.hostname,
      ),

    cpuCount:
      safeCall(
        osObject?.cpus,
      )?.length,
  });
}

/**
 * Detects CI environments.
 */
export function detectCI(
  variables:
    RuntimeEnvironmentVariables,
): boolean {
  const explicit =
    variables.CI ??
    variables.CONTINUOUS_INTEGRATION;

  if (
    isTruthyEnvironmentValue(
      explicit,
    )
  ) {
    return true;
  }

  if (
    variables.GITHUB_ACTIONS ===
    "true"
  ) {
    return true;
  }

  if (
    variables.GITLAB_CI ===
    "true"
  ) {
    return true;
  }

  if (
    variables.BUILDKITE ===
    "true"
  ) {
    return true;
  }

  if (
    variables.CIRCLECI ===
    "true"
  ) {
    return true;
  }

  if (
    variables.JENKINS_URL
  ) {
    return true;
  }

  return false;
}

/**
 * Detects whether the application is running inside
 * a container.
 */
export function detectContainer(
  variables:
    RuntimeEnvironmentVariables,
): boolean {
  if (
    isTruthyEnvironmentValue(
      variables.CONTAINER,
    )
  ) {
    return true;
  }

  if (
    isTruthyEnvironmentValue(
      variables.DOCKER_CONTAINER,
    )
  ) {
    return true;
  }

  if (
    variables.KUBERNETES_SERVICE_HOST
  ) {
    return true;
  }

  /**
   * Check common Node/Linux container indicators.
   */
  const processObject =
    getProcessObject();

  const release =
    processObject
      ?.env
      ?.container;

  if (
    release
  ) {
    return true;
  }

  return false;
}

/**
 * Reads process environment variables.
 */
function readProcessEnvironment():
  RuntimeEnvironmentVariables {
  const processObject =
    getProcessObject();

  if (
    !processObject?.env
  ) {
    return Object.freeze({});
  }

  return Object.freeze({
    ...processObject.env,
  });
}

/**
 * Retrieves the global process object safely.
 */
function getProcessObject():
  | RuntimeProcess
  | undefined {
  return (
    globalThis as {
      process?:
        RuntimeProcess;
    }
  ).process;
}

/**
 * Retrieves the Node os module when available.
 *
 * The module is intentionally accessed through the global
 * runtime when possible so this abstraction remains portable.
 */
function getNodeOsObject():
  | RuntimeOS
  | undefined {
  const runtimeProcess =
    getProcessObject();

  const requireFunction =
    (
      globalThis as {
        require?:
          (
            id: string,
          ) => unknown;
      }
    ).require;

  if (
    !requireFunction ||
    !runtimeProcess
  ) {
    return undefined;
  }

  try {
    return requireFunction(
      "node:os",
    ) as RuntimeOS;
  } catch {
    return undefined;
  }
}

/**
 * Executes an optional function safely.
 */
function safeCall<T>(
  fn:
    | (() => T)
    | undefined,
):
  T | undefined {
  if (!fn) {
    return undefined;
  }

  try {
    return fn();
  } catch {
    return undefined;
  }
}

/**
 * Converts common environment variable values
 * into boolean truthiness.
 */
function isTruthyEnvironmentValue(
  value:
    | string
    | undefined,
): boolean {
  if (
    value === undefined
  ) {
    return false;
  }

  return (
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "yes" ||
    value === "YES"
  );
}

/**
 * Minimal process shape required by this module.
 *
 * This avoids forcing the core package to depend directly
 * on Node.js types.
 */
interface RuntimeProcess {
  readonly pid?:
    number;

  readonly ppid?:
    number;

  readonly cwd?:
    () => string;

  readonly execPath?:
    string;

  readonly arch?:
    string;

  readonly version?:
    string;

  readonly platform?:
    string;

  readonly env?:
    Record<
      string,
      string | undefined
    >;

  readonly versions?:
    Readonly<
      Record<
        string,
        string | undefined
      >
    >;
}

/**
 * Minimal Node OS module shape.
 */
interface RuntimeOS {
  readonly hostname?:
    () => string;

  readonly cpus?:
    () => readonly unknown[];
}

/**
 * Error thrown when runtime environment access fails.
 */
export class RuntimeEnvironmentError
  extends Error {
  public readonly variable:
    string;

  public constructor(
    message:
      string,
    variable:
      string,
  ) {
    super(message);

    this.name =
      "RuntimeEnvironmentError";

    this.variable =
      variable;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}