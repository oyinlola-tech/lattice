/**
 * Environment Detection
 *
 * Runtime engine, platform, process, and environment detection.
 */

export {
  detectRuntimeEngine,
  detectPlatform,
  detectProcessInfo,
  detectHostInfo,
  readProcessEnvironment,
  getProcessObject,
} from "./runtimeEnvironment.detection.js";

export { getNodeOsObject, safeCall } from "./runtimeEnvironment.os.js";

export { detectCI, detectContainer } from "./runtimeEnvironment.env.js";
