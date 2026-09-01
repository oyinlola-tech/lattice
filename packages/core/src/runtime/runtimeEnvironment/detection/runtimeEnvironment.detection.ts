import type {
  RuntimePlatform,
  RuntimeEngineInfo,
  RuntimeProcessInfo,
  RuntimeHostInfo,
  RuntimeEnvironmentVariables,
  RuntimeProcess,
} from "../runtimeEnvironment.type.js";
import { getNodeOsObject, safeCall } from "./runtimeEnvironment.os.js";

export function detectRuntimeEngine(): RuntimeEngineInfo {
  const globalObject = globalThis as {
    process?: {
      versions?: { node?: string; bun?: string };
      version?: string;
    };
    Bun?: { version?: string };
    Deno?: { version?: Readonly<{ deno?: string }> };
    window?: unknown;
  };

  if (globalObject.Bun) {
    return Object.freeze({
      name: "bun",
      version: globalObject.Bun.version,
      nodeCompatible: true,
    });
  }

  if (globalObject.Deno) {
    return Object.freeze({
      name: "deno",
      version: globalObject.Deno.version?.deno,
      nodeCompatible: false,
    });
  }

  if (globalObject.process?.versions?.node) {
    return Object.freeze({
      name: "node",
      version: globalObject.process.versions.node,
      nodeCompatible: true,
    });
  }

  if (typeof globalObject.window !== "undefined") {
    return Object.freeze({
      name: "browser",
      nodeCompatible: false,
    });
  }

  return Object.freeze({
    name: "unknown",
    nodeCompatible: false,
  });
}

export function detectPlatform(): RuntimePlatform {
  const processObject = getProcessObject();
  const platform = processObject?.platform;

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

export function detectProcessInfo(): RuntimeProcessInfo {
  const processObject = getProcessObject();

  if (!processObject) {
    return Object.freeze({});
  }

  return Object.freeze({
    pid: processObject.pid,
    ppid: processObject.ppid,
    cwd: safeCall(processObject.cwd),
    execPath: processObject.execPath,
    arch: processObject.arch,
    version: processObject.version,
  });
}

export function detectHostInfo(platform: RuntimePlatform): RuntimeHostInfo {
  const processObject = getProcessObject();
  const osObject = getNodeOsObject();

  return Object.freeze({
    platform,
    architecture: processObject?.arch ?? "unknown",
    hostname: safeCall(osObject?.hostname),
    cpuCount: safeCall(osObject?.cpus)?.length,
  });
}

export function readProcessEnvironment(): RuntimeEnvironmentVariables {
  const processObject = getProcessObject();

  if (!processObject?.env) {
    return Object.freeze({});
  }

  return Object.freeze({
    ...processObject.env,
  });
}

export function getProcessObject(): RuntimeProcess | undefined {
  return (
    globalThis as {
      process?: RuntimeProcess;
    }
  ).process;
}
