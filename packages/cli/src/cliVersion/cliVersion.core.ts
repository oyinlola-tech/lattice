/**
 * zudojs-cli — Version Utilities
 *
 * Functions for parsing, comparing, and formatting semantic versions.
 */

import { CLI_DEFAULTS } from "../cliConstant/cliConstant.value.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Parsed version information. */
export interface CLIVersionInfo {
  readonly name: string;
  readonly version: string;
  readonly formatted: string;
}

/* -------------------------------------------------------------------------- */
/* Version Functions                                                          */
/* -------------------------------------------------------------------------- */

/** Returns version info for the CLI. */
export function getCLIVersion(
  name: string = CLI_DEFAULTS.NAME,
  version: string = CLI_DEFAULTS.VERSION,
): CLIVersionInfo {
  return {
    name,
    version,
    formatted: `${name} v${version}`,
  };
}

/** Formats a name and version into a display string. */
export function formatCLIVersion(name: string, version: string): string {
  return `${name} v${version}`;
}

/** Returns the version string as-is. */
export function getVersionString(
  version: string = CLI_DEFAULTS.VERSION,
): string {
  return version;
}

/** Returns whether a string is a valid semantic version. */
export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
    version.trim(),
  );
}

/** Compares two semantic versions. Returns -1, 0, or 1. */
export function compareVersions(first: string, second: string): number {
  const a = parseVersion(first);
  const b = parseVersion(second);

  for (let index = 0; index < 3; index++) {
    if (a[index]! > b[index]!) return 1;
    if (a[index]! < b[index]!) return -1;
  }

  return 0;
}

/** Parses a semantic version string into a numeric tuple. */
export function parseVersion(
  version: string,
): readonly [number, number, number] {
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    throw new TypeError(`Invalid semantic version: "${version}".`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Returns whether `version` satisfies `minimumVersion`. */
export function isCompatibleVersion(
  version: string,
  minimumVersion: string,
): boolean {
  return compareVersions(version, minimumVersion) >= 0;
}
