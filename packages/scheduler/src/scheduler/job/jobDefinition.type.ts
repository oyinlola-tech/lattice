import type { JobHandler } from "./jobHandler.type.js";

import type { JobOptions } from "./jobOptions.type.js";

/**
 * Definition of a scheduled job.
 */
export interface JobDefinition {
  readonly id: string;

  readonly name: string;

  readonly handler: JobHandler;

  readonly options?: JobOptions;
}

/**
 * Creates a job definition.
 */
export function createJobDefinition(
  id: string,
  name: string,
  handler: JobHandler,
  options: JobOptions = {},
): JobDefinition {
  return Object.freeze({
    id,
    name,
    handler,
    options: Object.freeze(options),
  });
}
